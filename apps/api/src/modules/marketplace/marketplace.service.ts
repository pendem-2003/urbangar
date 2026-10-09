import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ServiceCategory } from '@urbangar/database'

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async listProviders(category?: string, locality?: string) {
    return this.prisma.providerProfile.findMany({
      where: {
        isActive: true,
        isVerified: true,
        ...(category && { category: category as ServiceCategory }),
        ...(locality && { serviceAreas: { has: locality } }),
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { rating: 'desc' },
      take: 50,
    })
  }

  async bookService(seekerId: string, data: {
    providerProfileId: string
    scheduledAt: Date
    notes?: string
  }) {
    const provider = await this.prisma.providerProfile.findUnique({ where: { id: data.providerProfileId } })
    if (!provider) throw new NotFoundException()

    const booking = await this.prisma.serviceBooking.create({
      data: {
        seekerId,
        providerId: data.providerProfileId,
        category: provider.category,
        scheduledAt: data.scheduledAt,
        description: data.notes,
      },
    })

    await this.prisma.notification.create({
      data: {
        userId: provider.userId,
        type: 'SERVICE_BOOKING',
        title: 'New booking request',
        body: `You have a new booking for ${new Date(data.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`,
        data: { bookingId: booking.id },
      },
    })

    return booking
  }

  async getSeekerBookings(seekerId: string) {
    return this.prisma.serviceBooking.findMany({
      where: { seekerId },
      include: {
        provider: {
          select: { id: true, category: true, rating: true, user: { select: { name: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async upsertProviderProfile(userId: string, data: {
    category: ServiceCategory
    bio?: string
    areasServed?: string[]
    hourlyRate?: number
    experienceYears?: number
  }) {
    return this.prisma.providerProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })
  }

  async getProviderBookings(userId: string) {
    const provider = await this.prisma.providerProfile.findUnique({ where: { userId } })
    if (!provider) throw new NotFoundException('Provider profile not found')
    return this.prisma.serviceBooking.findMany({
      where: { providerId: provider.id },
      include: { seeker: { select: { name: true, phone: true } } },
      orderBy: { scheduledAt: 'desc' },
    })
  }
}
