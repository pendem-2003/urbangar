import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { BookingType, BookingStatus } from '@urbangar/database'

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async contactBroker(propertyId: string, seekerId: string, message?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true, ownerId: true, status: true, brokerAssignments: { where: { isActive: true, isPrimary: true }, include: { brokerProfile: { select: { userId: true } } }, take: 1 } },
    })
    if (!property || property.status !== 'ACTIVE') throw new NotFoundException('Property not found')

    // Record contact request (idempotent)
    const existing = await this.prisma.contactRequest.findFirst({ where: { userId: seekerId, propertyId } })
    if (!existing) {
      await this.prisma.contactRequest.create({ data: { userId: seekerId, propertyId } })
    }

    // Notify the broker (or owner if no broker assigned)
    const notifyUserId = property.brokerAssignments[0]?.brokerProfile?.userId ?? property.ownerId
    await this.prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'CONTACT_REQUEST',
        title: 'New contact request',
        body: message
          ? `Someone is interested in "${property.title}": "${message.slice(0, 120)}"`
          : `Someone is interested in "${property.title}". Check your leads.`,
        data: { propertyId, seekerId },
      },
    })

    return { success: true }
  }

  async scheduleVisit(propertyId: string, seekerId: string, scheduledAt: Date, notes?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId }, select: { status: true } })
    if (!property || property.status !== 'ACTIVE') throw new NotFoundException('Property not found')

    if (scheduledAt < new Date()) throw new BadRequestException('Visit must be scheduled in the future')

    const booking = await this.prisma.booking.create({
      data: {
        propertyId,
        seekerId,
        type: BookingType.VISIT,
        status: BookingStatus.PENDING,
        scheduledAt,
        notes,
      },
    })

    return booking
  }

  async confirmVisit(bookingId: string, actorId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: { select: { ownerId: true, brokerAssignments: { where: { isActive: true }, include: { brokerProfile: { select: { userId: true } } }, take: 1 } } } },
    })
    if (!booking) throw new NotFoundException()

    const isOwner = booking.property.ownerId === actorId
    const isBroker = booking.property.brokerAssignments[0]?.brokerProfile?.userId === actorId
    if (!isOwner && !isBroker) throw new ForbiddenException()

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    })

    // Notify seeker
    await this.prisma.notification.create({
      data: {
        userId: booking.seekerId,
        type: 'VISIT_CONFIRMED',
        title: 'Visit confirmed!',
        body: `Your site visit has been confirmed for ${booking.scheduledAt?.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`,
        data: { bookingId, propertyId: booking.propertyId },
      },
    })

    return { success: true }
  }

  async getSeekerBookings(seekerId: string) {
    return this.prisma.booking.findMany({
      where: { seekerId },
      orderBy: { createdAt: 'desc' },
      include: {
        property: { select: { id: true, title: true, locality: true, photos: true } },
      },
    })
  }
}
