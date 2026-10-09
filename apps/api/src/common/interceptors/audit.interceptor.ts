import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { Request } from 'express'
import { User } from '@urbangar/database'

// Write-method audit: logs route, user, and timing for all state-changing calls
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { user?: User }>()
    const { method, url, user } = request

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const start = Date.now()
      return next.handle().pipe(
        tap(() => {
          this.logger.log(
            `${method} ${url} | user=${user?.id ?? 'anon'} role=${user?.role ?? '-'} | ${Date.now() - start}ms`
          )
        })
      )
    }

    return next.handle()
  }
}
