import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PlatformConfig } from '@urbangar/types'
import { DEFAULT_PLATFORM_CONFIG } from '@urbangar/config'

@Injectable()
export class PlatformConfigService implements OnModuleInit {
  private cache: PlatformConfig = { ...DEFAULT_PLATFORM_CONFIG }

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.reload()
  }

  async reload() {
    const rows = await this.prisma.platformConfig.findMany()
    const config: Record<string, unknown> = {}
    for (const row of rows) {
      if (row.type === 'boolean') config[row.key] = row.value === 'true'
      else if (row.type === 'number') config[row.key] = Number(row.value)
      else config[row.key] = row.value
    }
    this.cache = { ...DEFAULT_PLATFORM_CONFIG, ...config } as PlatformConfig
  }

  get<K extends keyof PlatformConfig>(key: K): PlatformConfig[K] {
    return this.cache[key]
  }

  getAll(): PlatformConfig {
    return { ...this.cache }
  }

  async set(key: string, value: string, updatedBy: string): Promise<void> {
    await this.prisma.platformConfig.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { key, value, updatedBy, type: isNaN(Number(value)) ? (value === 'true' || value === 'false' ? 'boolean' : 'string') : 'number' },
    })
    await this.reload()
  }
}
