import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFiles, Req,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { PropertiesService } from './properties.service'
import { CreatePropertyDto } from './dto/create-property.dto'
import { UpdatePropertyDto } from './dto/update-property.dto'
import { SearchPropertiesDto } from './dto/search-properties.dto'
import { Role } from '@urbangar/types'
import { User } from '@urbangar/database'
import { Request } from 'express'

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  @Public()
  search(@Query() dto: SearchPropertiesDto, @Req() req: Request & { user?: User }): Promise<any> {
    const sessionId = req.headers['x-session-id'] as string | undefined
    return this.propertiesService.search(dto, req.user?.id, sessionId)
  }

  @Get('admin/pending')
  @Roles(Role.ADMIN)
  getPending(@Query('page') page = 1, @Query('limit') limit = 20): Promise<any> {
    return this.propertiesService.getPendingReview(+page, +limit)
  }

  @Get('admin/pending-edits')
  @Roles(Role.ADMIN)
  getPendingEdits(@Query('page') page = 1, @Query('limit') limit = 20): Promise<any> {
    return this.propertiesService.getPendingEdits(+page, +limit)
  }

  @Get('mine')
  @Roles(Role.OWNER, Role.ADMIN)
  getOwnerProperties(@CurrentUser() user: User): Promise<any> {
    return this.propertiesService.getOwnerProperties(user.id)
  }

  @Get(':id/contacts')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  getContacts(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.getContactsForProperty(id, user.id, user.role)
  }

  @Get(':id/owner')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  findOneForOwner(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.findOneForOwner(id, user.id, user.role)
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string, @Req() req: Request & { user?: User }): Promise<any> {
    const sessionId = req.headers['x-session-id'] as string | undefined
    return this.propertiesService.findOne(id, req.user?.id, sessionId)
  }

  @Get(':id/address')
  @Roles(Role.SEEKER)
  getFullAddress(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.getFullAddress(id, user.id)
  }

  @Post()
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.create(dto, user.id)
  }

  @Post(':id/photos')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 20, { limits: { fileSize: 15 * 1024 * 1024 } }))
  uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User
  ): Promise<any> {
    return this.propertiesService.uploadPhotos(id, user.id, user.role, files)
  }

  @Patch(':id/submit')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  submit(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.submit(id, user.id, user.role)
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.update(id, user.id, user.role, dto)
  }

  @Patch(':id/approve-edit')
  @Roles(Role.ADMIN)
  approvePendingEdit(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.approvePendingEdit(id, user.id)
  }

  @Patch(':id/reject-edit')
  @Roles(Role.ADMIN)
  rejectPendingEdit(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.rejectPendingEdit(id, user.id, reason)
  }

  @Post(':id/save')
  @Roles(Role.SEEKER)
  toggleSave(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.toggleSave(id, user.id)
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  approve(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.approve(id, user.id)
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  reject(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.reject(id, user.id, reason)
  }

  @Patch(':id/assign-broker')
  @Roles(Role.ADMIN, Role.BROKER)
  assignBroker(@Param('id') id: string, @Body('brokerProfileId') brokerProfileId: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.assignBroker(id, brokerProfileId, user.id)
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.propertiesService.remove(id, user.id, user.role)
  }
}
