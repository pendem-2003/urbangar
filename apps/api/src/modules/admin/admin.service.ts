import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PlatformConfigService } from '../../common/services/platform-config.service'
import { Prisma } from '@urbangar/database'

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private platformConfig: PlatformConfigService,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalProperties, pendingApprovals, activeLeases] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count({ where: { status: 'ACTIVE' } }),
      this.prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
      this.prisma.lease.count({ where: { status: 'ACTIVE' } }),
    ])
    return { totalUsers, totalProperties, pendingApprovals, activeLeases }
  }

  async getPendingApprovals(page = 1, limit = 20): Promise<any> {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { status: 'PENDING_REVIEW' },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          owner: { select: { id: true, name: true, phone: true } },
        },
      }),
      this.prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
    ])
    return { items, total, page, totalPages: Math.ceil(total / limit) }
  }

  async approveProperty(id: string, adminId: string) {
    const property = await this.prisma.property.findUnique({ where: { id } })
    if (!property) throw new NotFoundException()

    await this.prisma.property.update({
      where: { id },
      data: { status: 'ACTIVE', approvedAt: new Date(), approvedBy: adminId },
    })

    // Notify owner
    await this.prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'LISTING_APPROVED',
        title: 'Your listing is live!',
        body: `"${property.title}" has been approved and is now visible to seekers.`,
        data: { propertyId: id },
      },
    })

    return { success: true }
  }

  async rejectProperty(id: string, adminId: string, reason: string) {
    const property = await this.prisma.property.findUnique({ where: { id } })
    if (!property) throw new NotFoundException()

    await this.prisma.property.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason },
    })

    await this.prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'LISTING_REJECTED',
        title: 'Listing not approved',
        body: `"${property.title}" was not approved. Reason: ${reason}`,
        data: { propertyId: id },
      },
    })

    return { success: true }
  }

  async getPendingEdits(page = 1, limit = 20): Promise<any> {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { hasPendingEdit: true },
        orderBy: { updatedAt: 'asc' },
        skip,
        take: limit,
        include: {
          owner: { select: { id: true, name: true, phone: true } },
        },
      }),
      this.prisma.property.count({ where: { hasPendingEdit: true } }),
    ])
    return { items, total, page, totalPages: Math.ceil(total / limit) }
  }

  async approvePendingEdit(id: string, adminId: string) {
    const property = await this.prisma.property.findUnique({ where: { id } })
    if (!property) throw new NotFoundException()
    if (!property.hasPendingEdit || !property.pendingUpdate) {
      return { success: true, message: 'No pending edit' }
    }

    const changes = property.pendingUpdate as Record<string, unknown>
    await this.prisma.property.update({
      where: { id },
      data: { ...changes, hasPendingEdit: false, pendingUpdate: Prisma.DbNull },
    })

    await this.prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'LISTING_APPROVED',
        title: 'Your edit is live!',
        body: `The changes to "${property.title}" have been approved and are now visible.`,
        data: { propertyId: id },
      },
    })

    return { success: true }
  }

  async rejectPendingEdit(id: string, adminId: string, reason: string) {
    const property = await this.prisma.property.findUnique({ where: { id } })
    if (!property) throw new NotFoundException()

    await this.prisma.property.update({
      where: { id },
      data: { hasPendingEdit: false, pendingUpdate: Prisma.DbNull },
    })

    await this.prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'LISTING_REJECTED',
        title: 'Edit not approved',
        body: `Your requested changes to "${property.title}" were not approved. Reason: ${reason}`,
        data: { propertyId: id },
      },
    })

    return { success: true }
  }

  async getPlatformConfig() {
    const configs = await this.prisma.platformConfig.findMany({ orderBy: { key: 'asc' } })
    return configs
  }

  async updatePlatformConfig(key: string, value: string, adminId: string) {
    await this.platformConfig.set(key, value, adminId)
    return { success: true, key, value }
  }

  async getUsers(page = 1, limit = 50, q?: string) {
    const skip = (page - 1) * limit
    const where = q
      ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { phone: { contains: q } }] }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, phone: true, role: true, isActive: true, createdAt: true, verificationStatus: true },
      }),
      this.prisma.user.count({ where }),
    ])

    return { items, total, page, totalPages: Math.ceil(total / limit) }
  }

  async toggleUserActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException()
    await this.prisma.user.update({ where: { id }, data: { isActive: !user.isActive } })
    return { success: true, isActive: !user.isActive }
  }
}
