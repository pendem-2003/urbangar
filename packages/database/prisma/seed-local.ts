/**
 * Local test seed — run this once to get all test data loaded.
 *
 * Creates: Admin, Owner, Broker, Seeker users + 5 properties + Meilisearch index
 *
 * Usage (from packages/database directory):
 *   npx ts-node --project tsconfig.json --transpile-only prisma/seed-local.ts
 *
 * Login phones:
 *   Admin    → 9999999999
 *   Owner    → 9111111111
 *   Broker   → 9888888888
 *   Seeker   → 9222222222
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MEILI_URL = 'http://localhost:7700'
const MEILI_KEY = 'urbangar_meili_dev'

async function meili(method: string, path: string, body?: unknown) {
  const res = await fetch(`${MEILI_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${MEILI_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<any>
}

async function waitForTask(taskUid: number) {
  let status = 'enqueued'
  while (status === 'enqueued' || status === 'processing') {
    await new Promise((r) => setTimeout(r, 400))
    const task = await meili('GET', `/tasks/${taskUid}`)
    status = task.status
  }
  return status
}

async function main() {
  console.log('🌱 Seeding local test data...\n')

  // ─── Platform Config ────────────────────────────────────────────────────────

  const config = {
    onboardingFeeEnabled: false, onboardingFeeAmount: 999,
    tenantFeeEnabled: false, tenantFeeAmount: 0,
    rentCommissionEnabled: true, rentCommissionPct: 2,
    verificationFeeEnabled: true, verificationFeeAmount: 500,
    serviceBookingFeePct: 10, brokerDealCommissionPct: 50,
    maxContactRequestsPerDay: 5, nudgeDelayHours: 2,
    maxNudgesPerProperty: 2, nudgeCooldownHours: 24,
  }
  for (const [key, value] of Object.entries(config)) {
    const type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string'
    await prisma.platformConfig.upsert({
      where: { key }, update: { value: String(value) },
      create: { key, value: String(value), type },
    })
  }
  console.log('✅ Platform config seeded')

  // ─── Users ──────────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: { role: 'ADMIN', name: 'UrbanGar Admin' },
    create: { phone: '9999999999', name: 'UrbanGar Admin', role: 'ADMIN', email: 'admin@urbangar.com' },
  })
  console.log(`✅ Admin    → ${admin.phone}`)

  const owner = await prisma.user.upsert({
    where: { phone: '9111111111' },
    update: { role: 'OWNER', name: 'Suresh Reddy' },
    create: { phone: '9111111111', name: 'Suresh Reddy', role: 'OWNER', email: 'owner@test.com' },
  })
  console.log(`✅ Owner    → ${owner.phone}  (Suresh Reddy)`)

  const brokerUser = await prisma.user.upsert({
    where: { phone: '9888888888' },
    update: { role: 'BROKER', name: 'Ravi Kumar' },
    create: { phone: '9888888888', name: 'Ravi Kumar', role: 'BROKER', email: 'broker@test.com' },
  })
  let brokerProfile = await prisma.brokerProfile.findUnique({ where: { userId: brokerUser.id } })
  if (!brokerProfile) {
    brokerProfile = await prisma.brokerProfile.create({
      data: {
        userId: brokerUser.id,
        reraNumber: 'RERA/TS/2024/001',
        experienceYears: 5,
        bio: 'Specialist in Gachibowli, Kondapur, Madhapur',
        serviceAreas: ['Gachibowli', 'Kondapur', 'Madhapur', 'Hitech City'],
        isVerified: true,
      },
    })
  }
  console.log(`✅ Broker   → ${brokerUser.phone}  (Ravi Kumar)`)

  const seeker = await prisma.user.upsert({
    where: { phone: '9222222222' },
    update: { role: 'SEEKER', name: 'Priya Sharma' },
    create: { phone: '9222222222', name: 'Priya Sharma', role: 'SEEKER', email: 'seeker@test.com' },
  })
  console.log(`✅ Seeker   → ${seeker.phone}  (Priya Sharma)`)

  // ─── Properties ─────────────────────────────────────────────────────────────

  console.log('\nCreating properties...')

  const PROPS = [
    {
      id: 'prop-gachi-001',
      type: 'FLAT' as const,
      listingFor: 'RENT' as const,
      status: 'ACTIVE' as const,
      title: '3BHK Premium Flat in Gachibowli',
      description: 'Spacious 3BHK in a gated community near Mindspace IT park. 24/7 security, power backup, covered parking. Ready to move.',
      locality: 'Gachibowli',
      addressDisplay: 'Near Mindspace IT Park, Gachibowli, Hyderabad',
      addressFull: 'Flat 4B, Skyline Residency, Road No. 12, Gachibowli, Hyderabad 500032',
      pincode: '500032',
      latitude: 17.4401, longitude: 78.3489,
      monthlyRent: 35000, depositAmount: 70000, depositMonths: 2, maintenanceCharge: 3000,
      bhk: 3, bathrooms: 3, totalAreaSqft: 1850, carpetAreaSqft: 1550,
      floorNumber: 4, totalFloors: 12, ageYears: 3, facing: 'East',
      furnishing: 'SEMI_FURNISHED' as const, parkingAvailable: true, petFriendly: false,
      amenities: ['Power Backup', 'Lift', 'Security', 'CCTV', 'Parking', 'Gym', 'Gated Community'],
      photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    },
    {
      id: 'prop-kond-001',
      type: 'FLAT' as const,
      listingFor: 'RENT' as const,
      status: 'ACTIVE' as const,
      title: '2BHK Modern Apartment in Kondapur',
      description: 'Well-maintained 2BHK with modular kitchen and wardrobes. Walking distance to Hitec City metro.',
      locality: 'Kondapur',
      addressDisplay: 'Near Hitec City Metro, Kondapur, Hyderabad',
      addressFull: 'Flat 201, Greenview Apartments, Kondapur Main Rd, Hyderabad 500084',
      pincode: '500084',
      latitude: 17.4566, longitude: 78.3625,
      monthlyRent: 22000, depositAmount: 44000, depositMonths: 2, maintenanceCharge: 1500,
      bhk: 2, bathrooms: 2, totalAreaSqft: 1100, carpetAreaSqft: 950,
      floorNumber: 2, totalFloors: 5, ageYears: 6, facing: 'West',
      furnishing: 'FULLY_FURNISHED' as const, parkingAvailable: true, petFriendly: true,
      amenities: ['Power Backup', 'Lift', 'Security', 'Parking', 'Internet'],
      photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    },
    {
      id: 'prop-madh-001',
      type: 'PG' as const,
      listingFor: 'RENT' as const,
      status: 'ACTIVE' as const,
      title: 'Premium PG for Working Professionals — Madhapur',
      description: 'AC rooms near Hitech City. Meals, WiFi, housekeeping included. 2-sharing and single options.',
      locality: 'Madhapur',
      addressDisplay: 'Near Hitech City, Madhapur, Hyderabad',
      addressFull: 'H.No 4-50/23, Kavuri Hills Phase 2, Madhapur, Hyderabad 500081',
      pincode: '500081',
      latitude: 17.4485, longitude: 78.3908,
      monthlyRent: 9500, depositAmount: 9500, depositMonths: 1, maintenanceCharge: 0,
      bhk: 1, bathrooms: 1, totalAreaSqft: 200,
      furnishing: 'FULLY_FURNISHED' as const, parkingAvailable: false, petFriendly: false,
      genderPreference: 'ANY' as const,
      amenities: ['WiFi', 'AC', 'Geyser', 'Laundry', 'Meals', 'Housekeeping', 'Power Backup'],
      photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
    },
    {
      id: 'prop-jubi-001',
      type: 'VILLA' as const,
      listingFor: 'SALE' as const,
      status: 'ACTIVE' as const,
      title: '4BHK Luxury Villa in Jubilee Hills',
      description: 'Luxurious independent villa with private terrace and modular kitchen. Premium location near Road No. 36.',
      locality: 'Jubilee Hills',
      addressDisplay: 'Near Road No. 36, Jubilee Hills, Hyderabad',
      addressFull: 'Plot 112, Road No. 36, Jubilee Hills, Hyderabad 500033',
      pincode: '500033',
      latitude: 17.4326, longitude: 78.4072,
      salePrice: 25000000, depositMonths: 0,
      bhk: 4, bathrooms: 5, totalAreaSqft: 4200, carpetAreaSqft: 3800,
      ageYears: 2, facing: 'North',
      furnishing: 'FULLY_FURNISHED' as const, parkingAvailable: true, petFriendly: true,
      amenities: ['Power Backup', 'Security', 'CCTV', 'Parking', 'Garden', 'Swimming Pool'],
      photos: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'],
    },
    {
      id: 'prop-kuka-001',
      type: 'FLAT' as const,
      listingFor: 'RENT' as const,
      status: 'PENDING_REVIEW' as const,
      title: '1BHK Affordable Apartment in Kukatpally',
      description: 'Neat 1BHK near KPHB colony. Newly painted. Good water supply. Close to JNTU and KPHB metro.',
      locality: 'Kukatpally',
      addressDisplay: 'Near KPHB Colony, Kukatpally, Hyderabad',
      addressFull: 'Flat 3A, Sri Sai Residency, JNTU Road, Kukatpally, Hyderabad 500072',
      pincode: '500072',
      latitude: 17.4948, longitude: 78.3996,
      monthlyRent: 12000, depositAmount: 24000, depositMonths: 2, maintenanceCharge: 800,
      bhk: 1, bathrooms: 1, totalAreaSqft: 650,
      furnishing: 'UNFURNISHED' as const, parkingAvailable: false, petFriendly: false,
      amenities: ['Water 24/7', 'Security'],
      photos: [],
    },
  ]

  const createdProps: string[] = []
  for (const p of PROPS) {
    const { id, genderPreference, ...rest } = p as any
    await prisma.property.upsert({
      where: { id },
      update: { status: p.status },
      create: {
        id,
        ownerId: owner.id,
        city: 'Hyderabad',
        genderPreference: genderPreference ?? 'ANY',
        ...rest,
      },
    })
    createdProps.push(id)
    console.log(`  ✅ ${p.title.substring(0, 50)} [${p.status}]`)
  }

  // ─── Broker assignments ──────────────────────────────────────────────────────

  for (const propId of ['prop-gachi-001', 'prop-kond-001', 'prop-madh-001']) {
    await prisma.brokerAssignment.upsert({
      where: { propertyId_brokerProfileId: { propertyId: propId, brokerProfileId: brokerProfile!.id } },
      update: {},
      create: { propertyId: propId, brokerProfileId: brokerProfile!.id, isPrimary: true },
    })
  }
  console.log(`\n✅ Broker assigned to 3 properties`)

  // ─── Seeker: save a property ─────────────────────────────────────────────────

  await prisma.savedProperty.upsert({
    where: { userId_propertyId: { userId: seeker.id, propertyId: 'prop-gachi-001' } },
    update: {},
    create: { userId: seeker.id, propertyId: 'prop-gachi-001' },
  })
  console.log('✅ Seeker saved the Gachibowli flat')

  // ─── Meilisearch: set up index + index ACTIVE properties ─────────────────────

  console.log('\n🔍 Setting up Meilisearch index...')

  // Delete + recreate index so settings apply cleanly
  const del = await meili('DELETE', '/indexes/properties')
  if (del.taskUid) await waitForTask(del.taskUid)

  const create = await meili('POST', '/indexes', { uid: 'properties', primaryKey: 'id' })
  await waitForTask(create.taskUid)

  const settingsTask = await meili('PUT', '/indexes/properties/settings', {
    searchableAttributes: ['title', 'description', 'locality', 'city', 'addressDisplay'],
    filterableAttributes: ['status', 'type', 'listingFor', 'locality', 'city', 'bhk', 'furnishing', 'genderPreference', 'petFriendly', 'monthlyRent', 'salePrice', 'depositAmount', 'amenities'],
    sortableAttributes: ['monthlyRent', 'salePrice', 'totalAreaSqft', 'createdAt'],
    pagination: { maxTotalHits: 10000 },
  })
  const settingsStatus = await waitForTask(settingsTask.taskUid)
  console.log(`✅ Index settings: ${settingsStatus}`)

  // Index only ACTIVE properties (PENDING_REVIEW stays invisible in search)
  const activeProps = await prisma.property.findMany({ where: { status: 'ACTIVE' } })
  const docs = activeProps.map((p) => ({
    id: p.id, title: p.title, description: p.description,
    type: p.type, listingFor: p.listingFor, status: p.status,
    city: p.city, locality: p.locality, addressDisplay: p.addressDisplay,
    latitude: p.latitude, longitude: p.longitude,
    monthlyRent: p.monthlyRent, salePrice: p.salePrice,
    depositAmount: p.depositAmount, maintenanceCharge: p.maintenanceCharge,
    bhk: p.bhk, bathrooms: p.bathrooms, totalAreaSqft: p.totalAreaSqft,
    furnishing: p.furnishing, parkingAvailable: p.parkingAvailable,
    petFriendly: p.petFriendly, genderPreference: p.genderPreference,
    amenities: p.amenities, photos: p.photos,
    createdAt: new Date(p.createdAt).getTime(),
  }))

  const idxTask = await meili('POST', '/indexes/properties/documents', docs)
  const idxStatus = await waitForTask(idxTask.taskUid)
  console.log(`✅ Indexed ${docs.length} active properties: ${idxStatus}`)

  // Quick verify
  const testSearch = await meili('POST', '/indexes/properties/search', {
    q: '', filter: 'status = "ACTIVE"', limit: 10,
  })
  console.log(`✅ Test search returned ${testSearch.hits?.length ?? 0} results`)

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Done! Local seed complete.

Login phones (OTP printed in API terminal):
  Admin    → 9999999999
  Owner    → 9111111111  (Suresh Reddy, 5 properties)
  Broker   → 9888888888  (Ravi Kumar, assigned to 3 props)
  Seeker   → 9222222222  (Priya Sharma)

Properties in search (ACTIVE):
  • 3BHK Flat — Gachibowli   ₹35,000/mo
  • 2BHK Flat — Kondapur     ₹22,000/mo
  • PG       — Madhapur      ₹9,500/mo
  • Villa    — Jubilee Hills  ₹2.5Cr (sale)

Pending Admin approval:
  • 1BHK Flat — Kukatpally   ₹12,000/mo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

main()
  .catch((e) => { console.error(e?.message ?? e); process.exit(1) })
  .finally(() => prisma.$disconnect())
