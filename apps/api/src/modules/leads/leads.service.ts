import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { NudgeStatus } from '@urbangar/database'

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  private async getBrokerProfile(userId: string) {
    const broker = await this.prisma.brokerProfile.findUnique({ where: { userId } })
    if (!broker) throw new NotFoundException('Broker profile not found')
    return broker
  }

  // Get property IDs assigned to this broker
  private async getBrokerPropertyIds(brokerProfileId: string): Promise<string[]> {
    const assignments = await this.prisma.brokerAssignment.findMany({
      where: { brokerProfileId },
      select: { propertyId: true },
    })
    return assignments.map((a) => a.propertyId)
  }

  async getBrokerStats(userId: string) {
    const broker = await this.getBrokerProfile(userId)
    const propertyIds = await this.getBrokerPropertyIds(broker.id)

    const [activeListings, nudgePending, dealsClosed, totalLeads] = await Promise.all([
      this.prisma.property.count({ where: { id: { in: propertyIds }, status: 'ACTIVE' } }),
      // Count property views without corresponding nudge (= un-nudged interested leads)
      this.prisma.propertyView.groupBy({ by: ['propertyId', 'userId'], where: { propertyId: { in: propertyIds }, userId: { not: null } }, _count: { id: true } }).then((groups) => groups.length),
      this.prisma.lease.count({ where: { propertyId: { in: propertyIds } } }),
      this.prisma.contactRequest.count({ where: { propertyId: { in: propertyIds } } }),
    ])

    return { activeListings, totalLeads, nudgePending, dealsClosed }
  }

  async getBrokerNudges(userId: string, limit = 50) {
    const broker = await this.getBrokerProfile(userId)
    const propertyIds = await this.getBrokerPropertyIds(broker.id)

    // Find users who viewed but never contacted — represented by PropertyView without ContactRequest
    const viewGroups = await this.prisma.propertyView.groupBy({
      by: ['propertyId', 'userId'],
      where: { propertyId: { in: propertyIds }, userId: { not: null } },
      _count: { id: true },
      _max: { createdAt: true },
    })

    // Filter out those who already contacted
    const contactedSet = new Set<string>()
    const contacts = await this.prisma.contactRequest.findMany({
      where: { propertyId: { in: propertyIds } },
      select: { userId: true, propertyId: true },
    })
    contacts.forEach((c) => contactedSet.add(`${c.propertyId}:${c.userId}`))

    const interestedViews = viewGroups.filter(
      (v) => v.userId && !contactedSet.has(`${v.propertyId}:${v.userId}`)
    )

    // Fetch existing nudges for these
    const existingNudges = await this.prisma.leadNudge.findMany({
      where: { propertyId: { in: propertyIds } },
      select: { propertyId: true, seekerId: true, status: true, sentAt: true },
    })
    const nudgeMap = new Map<string, { status: string; sentAt: Date | null }>()
    existingNudges.forEach((n) =>
      nudgeMap.set(`${n.propertyId}:${n.seekerId}`, { status: n.status, sentAt: n.sentAt })
    )

    // Hydrate with user + property data
    const userIds = [...new Set(interestedViews.map((v) => v.userId!))]
    const propertyIdSet = [...new Set(interestedViews.map((v) => v.propertyId))]

    const [users, properties] = await Promise.all([
      this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, phone: true } }),
      this.prisma.property.findMany({ where: { id: { in: propertyIdSet } }, select: { id: true, title: true, locality: true, photos: true } }),
    ])

    const userMap = new Map(users.map((u) => [u.id, u]))
    const propMap = new Map(properties.map((p) => [p.id, p]))

    const items = interestedViews
      .slice(0, limit)
      .map((v) => {
        const key = `${v.propertyId}:${v.userId}`
        const nudge = nudgeMap.get(key)
        return {
          id: key,
          viewCount: v._count.id,
          lastViewedAt: v._max.createdAt,
          status: nudge?.status ?? 'PENDING',
          sentAt: nudge?.sentAt ?? null,
          user: userMap.get(v.userId!),
          property: propMap.get(v.propertyId),
        }
      })
      .filter((item) => item.user && item.property)

    return { items, total: items.length }
  }

  async sendNudge(propertyId: string, seekerId: string, brokerId: string) {
    const broker = await this.getBrokerProfile(brokerId)
    const propertyIds = await this.getBrokerPropertyIds(broker.id)

    if (!propertyIds.includes(propertyId)) throw new ForbiddenException('Property not assigned to you')

    // Upsert nudge record
    await this.prisma.leadNudge.upsert({
      where: { propertyId_seekerId_channel: { propertyId, seekerId, channel: 'in_app' } },
      create: { propertyId, seekerId, channel: 'in_app', status: NudgeStatus.SENT, sentAt: new Date() },
      update: { status: NudgeStatus.SENT, sentAt: new Date() },
    })

    // Create in-app notification
    const property = await this.prisma.property.findUnique({ where: { id: propertyId }, select: { title: true } })
    await this.prisma.notification.create({
      data: {
        userId: seekerId,
        type: 'NUDGE',
        title: 'A broker noticed your interest',
        body: `You viewed "${property?.title}". The assigned broker would love to connect with you.`,
        data: { propertyId },
      },
    })

    return { success: true }
  }

  async getBrokerListings(userId: string): Promise<any> {
    const broker = await this.getBrokerProfile(userId)
    const propertyIds = await this.getBrokerPropertyIds(broker.id)
    return this.prisma.property.findMany({
      where: { id: { in: propertyIds } },
      include: { _count: { select: { views: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getBrokerProfileDetails(userId: string) {
    const broker = await this.getBrokerProfile(userId)
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true, avatarUrl: true } })
    return { ...broker, user }
  }

  async updateBrokerProfile(userId: string, data: { reraNumber?: string; agencyName?: string; bio?: string }) {
    const broker = await this.getBrokerProfile(userId)
    return this.prisma.brokerProfile.update({ where: { id: broker.id }, data })
  }

  async getBrokerLeads(userId: string, _status?: string, q?: string) {
    const broker = await this.getBrokerProfile(userId)
    let propertyIds = await this.getBrokerPropertyIds(broker.id)

    // Text search: filter by property title if query provided
    if (q) {
      const matchingProperties = await this.prisma.property.findMany({
        where: { id: { in: propertyIds }, title: { contains: q, mode: 'insensitive' } },
        select: { id: true },
      })
      const matchingIds = matchingProperties.map((p) => p.id)
      propertyIds = matchingIds.length > 0 ? matchingIds : propertyIds
    }

    const contacts = await this.prisma.contactRequest.findMany({
      where: {
        propertyId: { in: propertyIds },
        ...(q && { user: { name: { contains: q, mode: 'insensitive' } } }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    })

    // Hydrate property info
    const propMap = new Map(
      (await this.prisma.property.findMany({
        where: { id: { in: [...new Set(contacts.map((c) => c.propertyId))] } },
        select: { id: true, title: true, locality: true },
      })).map((p) => [p.id, p])
    )

    const items = contacts.map((c) => ({ ...c, property: propMap.get(c.propertyId) }))

    return { items, total: items.length }
  }
}
