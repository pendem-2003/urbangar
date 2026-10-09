import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

export interface PropertyDocument {
  id: string
  title: string
  description: string
  type: string
  listingFor: string
  status: string
  city: string
  locality: string
  addressDisplay: string
  monthlyRent: number | null
  salePrice: number | null
  depositAmount: number | null
  bhk: number | null
  bathrooms: number | null
  totalAreaSqft: number | null
  furnishing: string
  genderPreference: string
  petFriendly: boolean
  mealsIncluded: boolean
  amenities: string[]
  photos: string[]
  latitude: number
  longitude: number
  availableBeds: number | null
  createdAt: number
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name)
  private http: AxiosInstance

  constructor(private config: ConfigService) {
    this.http = axios.create({
      baseURL: config.get('MEILI_URL', 'http://localhost:7700'),
      headers: {
        Authorization: `Bearer ${config.get('MEILI_MASTER_KEY', 'urbangar_meili_dev')}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async onModuleInit() {
    await this.setupIndex()
  }

  private async setupIndex() {
    try {
      // Create index if it doesn't exist — wait for the creation task to complete
      const createRes = await this.http.post('/indexes', { uid: 'properties', primaryKey: 'id' }).catch((e) => e?.response)
      if (createRes?.data?.taskUid) {
        await this.waitForTask(createRes.data.taskUid)
      }

      // Apply settings and wait — must complete before any search runs
      const { data: settingsTask } = await this.http.patch('/indexes/properties/settings', {
        searchableAttributes: ['title', 'description', 'locality', 'city', 'addressDisplay'],
        filterableAttributes: [
          'type', 'listingFor', 'status', 'locality', 'city',
          'bhk', 'furnishing', 'genderPreference', 'petFriendly',
          'mealsIncluded', 'amenities', 'monthlyRent', 'salePrice',
          'depositAmount', 'availableBeds',
        ],
        sortableAttributes: ['monthlyRent', 'salePrice', 'createdAt', 'totalAreaSqft'],
      })

      await this.waitForTask(settingsTask.taskUid)
      this.logger.log('Meilisearch properties index configured and ready')
    } catch (err: any) {
      this.logger.error('Meilisearch setup failed — search will be degraded', err?.response?.data ?? err?.message)
    }
  }

  private async waitForTask(taskUid: number, maxMs = 30000) {
    const deadline = Date.now() + maxMs
    while (Date.now() < deadline) {
      const { data } = await this.http.get(`/tasks/${taskUid}`)
      if (data.status === 'succeeded') return
      if (data.status === 'failed') throw new Error(`Meilisearch task ${taskUid} failed: ${JSON.stringify(data.error)}`)
      await new Promise((r) => setTimeout(r, 300))
    }
    throw new Error(`Meilisearch task ${taskUid} timed out after ${maxMs}ms`)
  }

  async indexProperty(doc: PropertyDocument) {
    await this.http
      .post('/indexes/properties/documents', [doc])
      .catch((err) => this.logger.warn('Failed to index property', err?.message))
  }

  async removeProperty(id: string) {
    await this.http
      .delete(`/indexes/properties/documents/${id}`)
      .catch((err) => this.logger.warn('Failed to remove property from index', err?.message))
  }

  async search(
    query: string,
    filter: string,
    sort: string[],
    page: number,
    hitsPerPage: number
  ): Promise<{ hits: PropertyDocument[]; totalHits: number }> {
    try {
      const { data } = await this.http.post('/indexes/properties/search', {
        q: query,
        filter: filter || undefined,
        sort: sort.length ? sort : undefined,
        page,
        hitsPerPage,
      })
      return { hits: data.hits ?? [], totalHits: data.totalHits ?? 0 }
    } catch (err) {
      this.logger.error('Meilisearch search failed', err)
      return { hits: [], totalHits: 0 }
    }
  }

  buildPropertyDoc(p: {
    id: string; title: string; description: string; type: string
    listingFor: string; status: string; city: string; locality: string
    addressDisplay: string; monthlyRent: number | null; salePrice: number | null
    depositAmount: number | null; bhk: number | null; bathrooms: number | null
    totalAreaSqft: number | null; furnishing: string; genderPreference: string
    petFriendly: boolean; mealsIncluded: boolean; amenities: string[]
    photos: string[]; latitude: number; longitude: number
    availableBeds: number | null; createdAt: Date
  }): PropertyDocument {
    return { ...p, createdAt: Math.floor(p.createdAt.getTime() / 1000) }
  }
}
