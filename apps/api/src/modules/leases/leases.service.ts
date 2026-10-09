import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SearchService } from '../../common/services/search.service'
import { Role } from '@urbangar/types'

@Injectable()
export class LeasesService {
  constructor(
    private prisma: PrismaService,
    private search: SearchService,
  ) {}

  // ─── Read ──────────────────────────────────────────────────────────────────

  async getTenantLease(tenantId: string) {
    return this.prisma.lease.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'PENDING'] } },
      include: {
        property: { select: { id: true, title: true, locality: true, photos: true, addressDisplay: true } },
        rentPayments: { orderBy: { createdAt: 'desc' }, take: 6 },
      },
    })
  }

  async getOwnerLeases(ownerId: string) {
    return this.prisma.lease.findMany({
      where: { property: { ownerId } },
      include: {
        property: { select: { id: true, title: true, locality: true } },
        tenant: { select: { id: true, name: true, phone: true } },
        rentPayments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getBrokerLeases(userId: string) {
    const broker = await this.prisma.brokerProfile.findUnique({ where: { userId } })
    if (!broker) throw new NotFoundException('Broker profile not found')
    return this.prisma.lease.findMany({
      where: { brokerProfileId: broker.id },
      include: {
        property: { select: { id: true, title: true, locality: true } },
        tenant: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getPropertyActiveLease(propertyId: string, userId: string, role: string): Promise<any> {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) throw new NotFoundException('Property not found')
    await this.assertCanManageProperty(property, userId, role)
    return this.prisma.lease.findFirst({
      where: { propertyId, status: 'ACTIVE' },
      include: {
        tenant: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      },
    })
  }

  async getTenantPayments(tenantId: string) {
    return this.prisma.rentPayment.findMany({
      where: { tenantId },
      include: {
        lease: { select: { property: { select: { title: true, locality: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    })
  }

  async getOwnerPayments(ownerId: string) {
    return this.prisma.rentPayment.findMany({
      where: { lease: { property: { ownerId } } },
      include: {
        lease: { select: { property: { select: { title: true, locality: true } } } },
        tenant: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  // ─── Create lease ─────────────────────────────────────────────────────────

  async createLease(
    dto: {
      propertyId: string
      tenantId: string
      startDate: string
      endDate: string
      monthlyRent: number
      depositAmount: number
    },
    userId: string,
    role: string,
  ): Promise<any> {
    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } })
    if (!property) throw new NotFoundException('Property not found')
    if (property.status !== 'ACTIVE') throw new BadRequestException('Property must be ACTIVE to create a lease')
    await this.assertCanManageProperty(property, userId, role)

    // Block if an active lease already exists
    const existing = await this.prisma.lease.findFirst({ where: { propertyId: dto.propertyId, status: 'ACTIVE' } })
    if (existing) throw new BadRequestException('This property already has an active lease')

    // Verify the tenant exists
    const tenant = await this.prisma.user.findUnique({ where: { id: dto.tenantId } })
    if (!tenant) throw new NotFoundException('Tenant not found')

    // Resolve broker profile if caller is a broker
    let brokerProfileId: string | undefined
    if (role === Role.BROKER) {
      const bp = await this.prisma.brokerProfile.findUnique({ where: { userId } })
      brokerProfileId = bp?.id
    }

    const lease = await this.prisma.lease.create({
      data: {
        propertyId: dto.propertyId,
        tenantId: dto.tenantId,
        brokerProfileId: brokerProfileId ?? null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        monthlyRent: dto.monthlyRent,
        depositAmount: dto.depositAmount,
        status: 'ACTIVE',
        depositStatus: 'HELD',
      },
      include: {
        tenant: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true } },
      },
    })

    // Mark property as RENTED and remove from public search
    await this.prisma.property.update({
      where: { id: dto.propertyId },
      data: { status: 'RENTED' },
    })
    await this.search.removeProperty(dto.propertyId)

    // Notify tenant
    await this.prisma.notification.create({
      data: {
        userId: dto.tenantId,
        type: 'GENERAL',
        title: 'Your tenancy is confirmed!',
        body: `Congratulations! Your tenancy for "${property.title}" has been confirmed by the owner.`,
        data: { propertyId: dto.propertyId, leaseId: lease.id },
      },
    })

    return lease
  }

  // ─── Terminate lease ──────────────────────────────────────────────────────

  async terminateLease(
    leaseId: string,
    dto: {
      reason: string
      depositStatus: 'RELEASED' | 'PARTIALLY_RELEASED' | 'FORFEITED'
      depositReturnedAmount?: number
    },
    userId: string,
    role: string,
  ): Promise<any> {
    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true },
    })
    if (!lease) throw new NotFoundException('Lease not found')
    if (lease.status !== 'ACTIVE') throw new BadRequestException('Lease is not active')
    await this.assertCanManageProperty(lease.property, userId, role)

    await this.prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: 'TERMINATED',
        terminatedAt: new Date(),
        terminationReason: dto.reason,
        depositStatus: dto.depositStatus,
        depositReturnedAmount: dto.depositReturnedAmount ?? null,
      },
    })

    // Re-activate property and re-index in search
    const updated = await this.prisma.property.update({
      where: { id: lease.propertyId },
      data: { status: 'ACTIVE' },
    })
    // Re-index the property in Meilisearch so it appears in search again
    const doc = this.search.buildPropertyDoc(updated as any)
    await this.search.indexProperty(doc)

    // Notify tenant
    await this.prisma.notification.create({
      data: {
        userId: lease.tenantId,
        type: 'GENERAL',
        title: 'Tenancy ended',
        body: `Your tenancy at "${lease.property.title}" has been ended. Deposit: ${dto.depositStatus.replace('_', ' ').toLowerCase()}.`,
        data: { propertyId: lease.propertyId, leaseId },
      },
    })

    return { terminated: true }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async assertCanManageProperty(
    property: { id: string; ownerId: string },
    userId: string,
    role: string,
  ) {
    if (role === Role.ADMIN) return
    if (role === Role.OWNER && property.ownerId === userId) return
    if (role === Role.BROKER) {
      const assignment = await this.prisma.brokerAssignment.findFirst({
        where: { propertyId: property.id, brokerProfile: { userId }, isActive: true },
      })
      if (assignment) return
    }
    throw new ForbiddenException('Not authorized to manage this property')
  }
}
