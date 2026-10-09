import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Logger,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SearchService, PropertyDocument } from '../../common/services/search.service'
import { UploadService } from '../../common/services/upload.service'
import { PlatformConfigService } from '../../common/services/platform-config.service'
import { CreatePropertyDto } from './dto/create-property.dto'
import { UpdatePropertyDto } from './dto/update-property.dto'
import { SearchPropertiesDto } from './dto/search-properties.dto'
import { Role } from '@urbangar/types'
import { AuditAction, Prisma } from '@urbangar/database'
import { MAP_BLUR_RADIUS_KM, PROPERTY_PHOTO_LIMIT } from '@urbangar/config'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name)

  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private upload: UploadService,
    private platformConfig: PlatformConfigService,
    private events: EventEmitter2,
  ) {}

  // ─── Create / Onboard ──────────────────────────────────────────────────────

  async create(dto: CreatePropertyDto, ownerId: string) {
    return this.prisma.property.create({
      data: {
        ...dto,
        ownerId,
        city: 'Hyderabad',
        status: 'DRAFT',
        amenities: dto.amenities ?? [],
        photos: [],
      },
    })
  }

  async uploadPhotos(
    propertyId: string,
    userId: string,
    role: string,
    files: Express.Multer.File[]
  ) {
    const property = await this.findOneOrThrow(propertyId)
    this.assertOwnerOrAdmin(property.ownerId, userId, role)

    if (property.photos.length + files.length > PROPERTY_PHOTO_LIMIT) {
      throw new BadRequestException(`Max ${PROPERTY_PHOTO_LIMIT} photos allowed`)
    }

    const urls = await Promise.all(
      files.map((f) => this.upload.uploadPropertyPhoto(f.buffer, f.mimetype, propertyId))
    )

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { photos: [...property.photos, ...urls] },
    })
    return { photos: updated.photos }
  }

  async submit(propertyId: string, userId: string, role: string) {
    const property = await this.findOneOrThrow(propertyId)
    this.assertOwnerOrAdmin(property.ownerId, userId, role)

    if (property.status !== 'DRAFT') {
      throw new BadRequestException('Only draft properties can be submitted')
    }
    if (!property.photos.length) {
      throw new BadRequestException('At least one photo required before submitting')
    }

    // Brokers/admins auto-publish; owners go to pending review
    const newStatus =
      role === Role.BROKER || role === Role.ADMIN ? 'ACTIVE' : 'PENDING_REVIEW'

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        status: newStatus as 'ACTIVE' | 'PENDING_REVIEW',
        ...(newStatus === 'ACTIVE' ? { approvedAt: new Date(), approvedBy: userId } : {}),
      },
    })

    if (newStatus === 'ACTIVE') await this.indexProperty(updated)

    await this.writeAuditLog(userId, role as Role, 'LISTING_APPROVED', 'Property', propertyId, {
      oldStatus: 'DRAFT', newStatus,
    })

    return updated
  }

  // ─── Update (pending-edit flow) ────────────────────────────────────────────

  async update(propertyId: string, userId: string, role: string, dto: UpdatePropertyDto) {
    const property = await this.findOneOrThrow(propertyId)
    await this.assertCanManage(property, userId, role)

    if (!['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED'].includes(property.status)) {
      throw new BadRequestException('Cannot edit a rented or sold property')
    }

    // Admins apply changes directly; owners/brokers queue as pending
    if (role === Role.ADMIN) {
      const updated = await this.prisma.property.update({
        where: { id: propertyId },
        data: { ...dto, hasPendingEdit: false, pendingUpdate: Prisma.DbNull },
      })
      if (updated.status === 'ACTIVE') await this.indexProperty(updated as any)
      return updated
    }

    // For DRAFT / PENDING_REVIEW — just apply directly (listing isn't live yet)
    if (property.status === 'DRAFT' || property.status === 'PENDING_REVIEW') {
      const updated = await this.prisma.property.update({
        where: { id: propertyId },
        data: dto,
      })
      return updated
    }

    // ACTIVE or REJECTED — store as pendingUpdate, live data untouched
    await this.prisma.property.update({
      where: { id: propertyId },
      data: { pendingUpdate: dto as any, hasPendingEdit: true },
    })

    return this.prisma.property.findUnique({ where: { id: propertyId } })
  }

  async getPendingEdits(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { hasPendingEdit: true },
        include: { owner: { select: { id: true, name: true, phone: true } } },
        orderBy: { updatedAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.property.count({ where: { hasPendingEdit: true } }),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async approvePendingEdit(propertyId: string, adminId: string) {
    const property = await this.findOneOrThrow(propertyId)
    if (!property.hasPendingEdit || !property.pendingUpdate) {
      throw new BadRequestException('No pending edit to approve')
    }

    const changes = property.pendingUpdate as Record<string, unknown>
    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { ...changes, hasPendingEdit: false, pendingUpdate: Prisma.DbNull },
    })

    if (updated.status === 'ACTIVE') await this.indexProperty(updated as any)

    await this.writeAuditLog(adminId, Role.ADMIN, 'LISTING_APPROVED', 'Property', propertyId, {
      action: 'approved_pending_edit',
    })

    return updated
  }

  async rejectPendingEdit(propertyId: string, adminId: string, reason: string) {
    const property = await this.findOneOrThrow(propertyId)
    if (!property.hasPendingEdit) {
      throw new BadRequestException('No pending edit to reject')
    }

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { hasPendingEdit: false, pendingUpdate: Prisma.DbNull, rejectionReason: reason },
    })

    await this.writeAuditLog(adminId, Role.ADMIN, 'LISTING_REJECTED', 'Property', propertyId, {
      action: 'rejected_pending_edit', reason,
    })

    return updated
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  async remove(propertyId: string, userId: string, role: string): Promise<any> {
    const property = await this.findOneOrThrow(propertyId)
    await this.assertCanManage(property, userId, role)

    // Block if an active lease exists — tenant is still living there
    const activeLease = await this.prisma.lease.findFirst({
      where: { propertyId, status: 'ACTIVE' },
    })
    if (activeLease) {
      throw new BadRequestException('Cannot archive a property with an active lease. Terminate the lease first.')
    }

    // Soft-archive: remove from search but preserve all history
    await this.prisma.property.update({
      where: { id: propertyId },
      data: { isArchived: true, archivedAt: new Date(), status: 'INACTIVE' },
    })
    await this.searchService.removeProperty(propertyId)

    await this.writeAuditLog(userId, role as Role, AuditAction.LISTING_DELETED, 'Property', propertyId, {
      title: property.title,
      previousStatus: property.status,
    })

    return { archived: true }
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  async search(dto: SearchPropertiesDto, viewerUserId?: string, sessionId?: string) {
    const { q = '', page = 1, limit = 20, sortBy, lat, lng, radiusKm, ...filters } = dto

    const filterParts: string[] = ['status = "ACTIVE"']

    if (filters.type) filterParts.push(`type = "${filters.type}"`)
    if (filters.listingFor) filterParts.push(`listingFor = "${filters.listingFor}"`)
    if (filters.locality) filterParts.push(`locality = "${filters.locality}"`)
    if (filters.genderPreference) filterParts.push(`genderPreference = "${filters.genderPreference}"`)
    if (filters.petFriendly !== undefined) filterParts.push(`petFriendly = ${filters.petFriendly}`)

    if (filters.minBhk !== undefined) {
      filterParts.push(`bhk >= ${filters.minBhk}`)
    } else if (filters.bhk?.length) {
      filterParts.push(`(${filters.bhk.map((b) => `bhk = ${b}`).join(' OR ')})`)
    }
    if (filters.furnishing?.length) {
      filterParts.push(`(${filters.furnishing.map((f) => `furnishing = "${f}"`).join(' OR ')})`)
    }
    if (filters.amenities?.length) {
      filterParts.push(`(${filters.amenities.map((a) => `amenities = "${a}"`).join(' AND ')})`)
    }

    const priceField = filters.listingFor === 'SALE' ? 'salePrice' : 'monthlyRent'
    if (filters.minPrice !== undefined) filterParts.push(`${priceField} >= ${filters.minPrice}`)
    if (filters.maxPrice !== undefined) filterParts.push(`${priceField} <= ${filters.maxPrice}`)
    if (filters.minDeposit !== undefined) filterParts.push(`depositAmount >= ${filters.minDeposit}`)
    if (filters.maxDeposit !== undefined) filterParts.push(`depositAmount <= ${filters.maxDeposit}`)

    const sortMap: Record<string, string[]> = {
      price_asc: ['monthlyRent:asc', 'salePrice:asc'],
      price_desc: ['monthlyRent:desc', 'salePrice:desc'],
      newest: ['createdAt:desc'],
      area_desc: ['totalAreaSqft:desc'],
    }
    const sort = sortMap[sortBy ?? ''] ?? ['createdAt:desc']

    const result = await this.searchService.search(
      q, filterParts.join(' AND '), sort, page, limit
    )

    let hits = result.hits as PropertyDocument[]

    // PostGIS geo filter if lat/lng provided
    if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
      const nearbyIds = await this.getNearbyIds(lat, lng, radiusKm)
      const nearbySet = new Set(nearbyIds)
      hits = hits.filter((h) => nearbySet.has(h.id))
    }

    return {
      data: hits.map((h) => this.blurLocation(h)),
      total: result.totalHits ?? 0,
      page,
      limit,
      totalPages: Math.ceil((result.totalHits ?? 0) / limit),
    }
  }

  async findOne(id: string, viewerUserId?: string, sessionId?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } },
        brokerAssignments: {
          where: { isActive: true, isPrimary: true },
          include: {
            brokerProfile: {
              include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            },
          },
          take: 1,
        },
        _count: { select: { views: true, savedBy: true } },
      },
    })

    if (!property || property.status === 'DRAFT') throw new NotFoundException('Property not found')

    // Track view
    this.prisma.propertyView.create({
      data: { propertyId: id, userId: viewerUserId ?? null, sessionId: sessionId ?? null, source: 'direct' },
    }).catch(() => null)

    if (viewerUserId) {
      this.events.emit('property.viewed', { propertyId: id, userId: viewerUserId })
    }

    return {
      ...property,
      latitude: this.blurCoordinate(property.latitude),
      longitude: this.blurCoordinate(property.longitude),
      addressFull: undefined,
      primaryBroker: property.brokerAssignments[0]?.brokerProfile ?? null,
      viewCount: property._count.views,
      savedCount: property._count.savedBy,
    }
  }

  async getFullAddress(propertyId: string, userId: string) {
    const confirmedVisit = await this.prisma.booking.findFirst({
      where: { propertyId, seekerId: userId, type: 'VISIT', status: 'CONFIRMED' },
    })
    if (!confirmedVisit) {
      throw new ForbiddenException('Schedule and confirm a visit to get the exact address')
    }
    return this.prisma.property.findUniqueOrThrow({
      where: { id: propertyId },
      select: { addressFull: true, latitude: true, longitude: true },
    })
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async approve(propertyId: string, adminId: string) {
    const property = await this.findOneOrThrow(propertyId)
    if (property.status !== 'PENDING_REVIEW') {
      throw new BadRequestException('Only pending properties can be approved')
    }
    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'ACTIVE', approvedAt: new Date(), approvedBy: adminId },
    })
    await this.indexProperty(updated)
    await this.writeAuditLog(adminId, Role.ADMIN, 'LISTING_APPROVED', 'Property', propertyId, {
      oldStatus: 'PENDING_REVIEW', newStatus: 'ACTIVE',
    })
    return updated
  }

  async reject(propertyId: string, adminId: string, reason: string) {
    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'REJECTED', rejectionReason: reason },
    })
    await this.searchService.removeProperty(propertyId)
    await this.writeAuditLog(adminId, Role.ADMIN, 'LISTING_REJECTED', 'Property', propertyId, { reason })
    return updated
  }

  async assignBroker(propertyId: string, brokerProfileId: string, adminId: string) {
    const broker = await this.prisma.brokerProfile.findUniqueOrThrow({ where: { id: brokerProfileId } })
    if (!broker.isVerified) throw new BadRequestException('Broker is not verified')

    await this.prisma.brokerAssignment.updateMany({
      where: { propertyId, isPrimary: true },
      data: { isPrimary: false },
    })

    const assignment = await this.prisma.brokerAssignment.upsert({
      where: { propertyId_brokerProfileId: { propertyId, brokerProfileId } },
      create: { propertyId, brokerProfileId, isPrimary: true, isActive: true },
      update: { isPrimary: true, isActive: true },
    })

    await this.writeAuditLog(adminId, Role.ADMIN, 'BROKER_ASSIGNED', 'Property', propertyId, { brokerProfileId })
    return assignment
  }

  async getPendingReview(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { status: 'PENDING_REVIEW' },
        include: { owner: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getOwnerProperties(ownerId: string) {
    return this.prisma.property.findMany({
      where: { ownerId, isArchived: false },
      include: { _count: { select: { views: true, savedBy: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getContactsForProperty(propertyId: string, userId: string, role: string) {
    const property = await this.findOneOrThrow(propertyId)
    await this.assertCanManage(property, userId, role)
    return this.prisma.contactRequest.findMany({
      where: { propertyId },
      include: { user: { select: { id: true, name: true, phone: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOneForOwner(propertyId: string, userId: string, role: string) {
    const property = await this.findOneOrThrow(propertyId)
    await this.assertCanManage(property, userId, role)
    return property
  }

  async toggleSave(propertyId: string, userId: string) {
    const existing = await this.prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    })
    if (existing) {
      await this.prisma.savedProperty.delete({ where: { userId_propertyId: { userId, propertyId } } })
      return { saved: false }
    }
    await this.prisma.savedProperty.create({ data: { userId, propertyId } })
    return { saved: true }
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  private async findOneOrThrow(id: string) {
    const p = await this.prisma.property.findUnique({ where: { id } })
    if (!p) throw new NotFoundException('Property not found')
    return p
  }

  private assertOwnerOrAdmin(ownerId: string, userId: string, role: string) {
    if (role !== Role.ADMIN && ownerId !== userId) {
      throw new ForbiddenException('Not authorized')
    }
  }

  private async assertCanManage(property: { id: string; ownerId: string }, userId: string, role: string) {
    if (role === Role.ADMIN) return
    if (role === Role.OWNER && property.ownerId === userId) return
    if (role === Role.BROKER) {
      const assignment = await this.prisma.brokerAssignment.findFirst({
        where: { propertyId: property.id, brokerProfile: { userId }, isActive: true },
      })
      if (assignment) return
    }
    throw new ForbiddenException('Not authorized to edit this property')
  }

  private async getNearbyIds(lat: number, lng: number, radiusKm: number): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM properties
      WHERE ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radiusKm * 1000}
      ) AND status = 'ACTIVE'
    `
    return rows.map((r) => r.id)
  }

  private blurLocation<T extends { latitude: number; longitude: number }>(item: T): T {
    return { ...item, latitude: this.blurCoordinate(item.latitude), longitude: this.blurCoordinate(item.longitude) }
  }

  private blurCoordinate(coord: number): number {
    const offset = (Math.random() - 0.5) * MAP_BLUR_RADIUS_KM * 0.009
    return Math.round((coord + offset) * 100000) / 100000
  }

  private async indexProperty(p: { id: string; title: string; description: string; type: string; listingFor: string; status: string; city: string; locality: string; addressDisplay: string; monthlyRent: number | null; salePrice: number | null; depositAmount: number | null; bhk: number | null; bathrooms: number | null; totalAreaSqft: number | null; furnishing: string; genderPreference: string; petFriendly: boolean; mealsIncluded: boolean; amenities: string[]; photos: string[]; latitude: number; longitude: number; availableBeds: number | null; createdAt: Date }) {
    const doc = this.searchService.buildPropertyDoc(p)
    await this.searchService.indexProperty(doc)
  }

  private async writeAuditLog(
    userId: string, role: Role, action: AuditAction,
    entityType: string, entityId: string, data: Prisma.JsonObject
  ) {
    await this.prisma.auditLog.create({
      data: { userId, role, action, entityType, entityId, newValue: data },
    }).catch(() => null)
  }
}
