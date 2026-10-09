import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { MaintenanceCategory, MaintenancePaidBy, MaintenanceStatus } from '@urbangar/database'

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async createRequest(tenantId: string, data: {
    propertyId: string
    category: MaintenanceCategory
    description: string
    photos?: string[]
  }) {
    // Verify tenant has an active lease on this property
    const lease = await this.prisma.lease.findFirst({
      where: { tenantId, propertyId: data.propertyId, status: 'ACTIVE' },
    })
    if (!lease) throw new ForbiddenException('No active lease for this property')

    const req = await this.prisma.maintenanceRequest.create({
      data: {
        propertyId: data.propertyId,
        tenantId,
        category: data.category,
        description: data.description,
        photos: data.photos ?? [],
        paidBy: MaintenancePaidBy.OWNER,
      },
    })

    const property = await this.prisma.property.findUnique({
      where: { id: data.propertyId },
      select: { ownerId: true, title: true },
    })
    if (property) {
      await this.prisma.notification.create({
        data: {
          userId: property.ownerId,
          type: 'MAINTENANCE_REQUEST',
          title: 'New maintenance request',
          body: `Tenant raised a ${data.category.toLowerCase()} issue in "${property.title}"`,
          data: { requestId: req.id, propertyId: data.propertyId },
        },
      })
    }

    return req
  }

  async getTenantRequests(tenantId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: { tenantId },
      include: { property: { select: { title: true, locality: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getOwnerRequests(ownerId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: { property: { ownerId } },
      include: {
        property: { select: { id: true, title: true, locality: true } },
        tenant: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateStatus(id: string, ownerId: string, status: MaintenanceStatus) {
    const req = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { property: { select: { ownerId: true } } },
    })
    if (!req) throw new NotFoundException()
    if (req.property.ownerId !== ownerId) throw new ForbiddenException()

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === MaintenanceStatus.RESOLVED ? new Date() : undefined,
      },
    })
  }
}
