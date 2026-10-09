import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { v4 as uuid } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)
  private s3: S3Client
  private bucket: string
  private publicUrl: string

  private devMode: boolean

  constructor(private config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID', '')
    this.bucket = config.get('R2_BUCKET_NAME', 'urbangar-media')
    this.publicUrl = config.get('R2_PUBLIC_URL', 'http://localhost:4000/media')

    // Dev mode: skip real uploads when R2 is not configured
    this.devMode = !accountId || accountId.startsWith('your_')

    if (!this.devMode) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.get('R2_ACCESS_KEY_ID', ''),
          secretAccessKey: config.get('R2_SECRET_ACCESS_KEY', ''),
        },
      })
    }
  }

  async uploadPropertyPhoto(
    buffer: Buffer,
    mimeType: string,
    propertyId: string
  ): Promise<string> {
    if (this.devMode) {
      const processed = await sharp(buffer)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 82, progressive: true })
        .toBuffer()

      const uploadsDir = path.join(process.cwd(), 'uploads', 'properties', propertyId)
      fs.mkdirSync(uploadsDir, { recursive: true })

      const filename = `${uuid()}.jpg`
      fs.writeFileSync(path.join(uploadsDir, filename), processed)

      const url = `http://localhost:4000/uploads/properties/${propertyId}/${filename}`
      this.logger.log(`[DEV] Saved photo locally: ${url}`)
      return url
    }

    const processed = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .withMetadata({})
      .jpeg({ quality: 82, progressive: true })
      .toBuffer()

    const key = `properties/${propertyId}/${uuid()}.jpg`
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: processed,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000',
      })
    )

    return `${this.publicUrl}/${key}`
  }

  async uploadDocument(
    buffer: Buffer,
    mimeType: string,
    folder: string,
    filename: string
  ): Promise<string> {
    if (this.devMode) {
      this.logger.log(`[DEV] Skipping R2 document upload`)
      return `http://localhost:4000/media/documents/${folder}/${filename}`
    }

    const key = `documents/${folder}/${uuid()}-${filename}`
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    )
    return `${this.publicUrl}/${key}`
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, '')
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    } catch (err) {
      this.logger.warn(`Failed to delete ${key}`, err)
    }
  }
}
