import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, email: true, name: true,
        avatarUrl: true, role: true, createdAt: true,
        aadhaarVerified: true, verificationStatus: true,
        brokerProfile: { select: { id: true, isVerified: true, rating: true, totalDeals: true } },
        providerProfile: { select: { id: true, category: true, isVerified: true, rating: true } },
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateMe(userId: string, data: { name?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, phone: true, email: true, name: true, avatarUrl: true, role: true },
    })
  }

  async getSeekerSummary(userId: string) {
    const [savedProperties, activeLease, unreadNotifications] = await Promise.all([
      this.prisma.savedProperty.count({ where: { userId } }),
      this.prisma.lease.findFirst({ where: { tenantId: userId, status: 'ACTIVE' }, select: { id: true, endDate: true, monthlyRent: true } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return {
      savedProperties,
      activeLease: activeLease ? { id: activeLease.id, endDate: activeLease.endDate, monthlyRent: activeLease.monthlyRent } : null,
      nextRentDue: activeLease ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null,
      unreadNotifications,
    }
  }

  async getSavedProperties(userId: string) {
    return this.prisma.savedProperty.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true, title: true, locality: true, listingFor: true,
            monthlyRent: true, salePrice: true, bhk: true, photos: true, furnishing: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getOwnerSummary(userId: string) {
    const [activeListings, activeTenants, openMaintenance] = await Promise.all([
      this.prisma.property.count({ where: { ownerId: userId, status: 'ACTIVE' } }),
      this.prisma.lease.count({ where: { property: { ownerId: userId }, status: 'ACTIVE' } }),
      this.prisma.maintenanceRequest.count({ where: { property: { ownerId: userId }, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }),
    ])

    // Sum rent from active leases this month
    const activeLeases = await this.prisma.lease.findMany({
      where: { property: { ownerId: userId }, status: 'ACTIVE' },
      select: { monthlyRent: true },
    })
    const rentCollectedThisMonth = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0)

    return { activeListings, activeTenants, rentCollectedThisMonth, openMaintenance }
  }
}
