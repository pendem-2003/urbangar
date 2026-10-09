import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { AppModule } from './app.module'
import helmet from 'helmet'
import compression from 'compression'
import * as path from 'path'
import * as fs from 'fs'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  })

  // Serve locally uploaded files in dev mode
  const uploadsDir = path.join(process.cwd(), 'uploads')
  fs.mkdirSync(uploadsDir, { recursive: true })
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' })

  // Security
  app.use(helmet())
  app.use(compression())

  app.enableCors({
    origin: process.env['CORS_ORIGINS']?.split(',') ?? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // Global API prefix and versioning
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // Validation — strip unknown fields, transform types automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  )

  const port = process.env['PORT'] ?? 4001
  await app.listen(port)
  console.log(`🚀 UrbanGar API running on http://localhost:${port}/api/v1`)
}

bootstrap()

declare const module: any
if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => {})
}
