/**
 * One-time script to push all ACTIVE properties from Postgres into Meilisearch.
 * Run whenever properties are seeded directly into the DB.
 *
 * Usage: cd packages/database && npx ts-node --project tsconfig.json --transpile-only prisma/index-properties.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const MEILI_URL = process.env['MEILI_URL'] ?? 'http://localhost:7700'
const MEILI_KEY = process.env['MEILI_MASTER_KEY'] ?? 'urbangar_meili_dev'

async function meili(method: string, path: string, body?: unknown) {
  const res = await fetch(`${MEILI_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${MEILI_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  return text ? JSON.parse(text) : {}
}

async function main() {
  console.log('🔍 Connecting to Meilisearch at', MEILI_URL)

  // Create index if missing
  await meili('POST', '/indexes', { uid: 'properties', primaryKey: 'id' }).catch?.(() => null)

  // Configure filterable + sortable attributes
  await meili('PUT', '/indexes/properties/settings', {
    searchableAttributes: ['title', 'description', 'locality', 'city', 'addressDisplay'],
    filterableAttributes: ['status', 'type', 'listingFor', 'locality', 'city', 'bhk', 'furnishing', 'genderPreference', 'petFriendly', 'monthlyRent', 'salePrice', 'depositAmount', 'amenities'],
    sortableAttributes: ['monthlyRent', 'salePrice', 'totalAreaSqft', 'createdAt'],
    pagination: { maxTotalHits: 10000 },
  })
  console.log('✅ Index settings configured')

  const properties = await prisma.property.findMany({
    where: { status: { in: ['ACTIVE', 'RENTED'] } },
  })
  console.log(`📦 Found ${properties.length} properties to index`)

  if (!properties.length) {
    console.log('Nothing to index.')
    return
  }

  const docs = properties.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    type: p.type,
    listingFor: p.listingFor,
    status: p.status,
    city: p.city,
    locality: p.locality,
    addressDisplay: p.addressDisplay,
    latitude: p.latitude,
    longitude: p.longitude,
    monthlyRent: p.monthlyRent,
    salePrice: p.salePrice,
    depositAmount: p.depositAmount,
    maintenanceCharge: p.maintenanceCharge,
    bhk: p.bhk,
    bathrooms: p.bathrooms,
    totalAreaSqft: p.totalAreaSqft,
    furnishing: p.furnishing,
    parkingAvailable: p.parkingAvailable,
    petFriendly: p.petFriendly,
    genderPreference: p.genderPreference,
    amenities: p.amenities,
    photos: p.photos,
    createdAt: new Date(p.createdAt).getTime(),
  }))

  const result = await meili('POST', '/indexes/properties/documents', docs)
  console.log(`✅ Indexed ${docs.length} properties (task uid: ${result.taskUid})`)

  // Wait for indexing task to complete
  let status = 'enqueued'
  while (status !== 'succeeded' && status !== 'failed') {
    await new Promise((r) => setTimeout(r, 300))
    const task = await meili('GET', `/tasks/${result.taskUid}`)
    status = task.status
    process.stdout.write('.')
  }
  console.log(`\n${status === 'succeeded' ? '🎉' : '❌'} Indexing ${status}`)

  // Quick verify
  const stats = await meili('GET', '/indexes/properties/stats')
  console.log(`📊 Total documents in index: ${stats.numberOfDocuments}`)
}

main()
  .catch((e) => { console.error(e?.response?.data ?? e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
