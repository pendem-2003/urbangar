import { Module } from '@nestjs/common'
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { PropertiesModule } from './modules/properties/properties.module'
import { BookingsModule } from './modules/bookings/bookings.module'
import { LeasesModule } from './modules/leases/leases.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { MaintenanceModule } from './modules/maintenance/maintenance.module'
import { MarketplaceModule } from './modules/marketplace/marketplace.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { LeadsModule } from './modules/leads/leads.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { AdminModule } from './modules/admin/admin.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { AuditInterceptor } from './common/interceptors/audit.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60000, limit: 100 },
      { name: 'long', ttl: 3600000, limit: 1000 },
    ]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    BookingsModule,
    LeasesModule,
    PaymentsModule,
    MaintenanceModule,
    MarketplaceModule,
    NotificationsModule,
    LeadsModule,
    AnalyticsModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
