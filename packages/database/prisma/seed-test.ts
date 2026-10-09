/**
 * Test seed for local E2E testing.
 * Creates users for every role + sample properties, lease, bookings, maintenance, etc.
 *
 * Run: cd packages/database && npx ts-node --project tsconfig.json prisma/seed-test.ts
 *
 * Test phone numbers (use in login):
 *   Admin:    9999999999
 *   Owner:    9111111111
 *   Broker:   9888888888
 *   Seeker:   9222222222
 *   Provider: 9333333333
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test data...\n')

  // ── Users ────────────────────────────────────────────────────────────────────

  const owner = await prisma.user.upsert({
    where: { phone: '9111111111' },
    create: {
      phone: '9111111111',
      name: 'Suresh Reddy',
      email: 'owner@test.com',
      role: 'OWNER',
      isActive: true,
    },
    update: { name: 'Suresh Reddy', role: 'OWNER' },
  })
  console.log(`✅ Owner: ${owner.phone} — ${owner.name} (id: ${owner.id})`)

  const seeker = await prisma.user.upsert({
    where: { phone: '9222222222' },
    create: {
      phone: '9222222222',
      name: 'Priya Sharma',
      email: 'seeker@test.com',
      role: 'SEEKER',
      isActive: true,
    },
    update: { name: 'Priya Sharma', role: 'SEEKER' },
  })
  console.log(`✅ Seeker: ${seeker.phone} — ${seeker.name} (id: ${seeker.id})`)

  const provider = await prisma.user.upsert({
    where: { phone: '9333333333' },
    create: {
      phone: '9333333333',
      name: 'Mohammed Salim',
      email: 'provider@test.com',
      role: 'PROVIDER',
      isActive: true,
    },
    update: { name: 'Mohammed Salim', role: 'PROVIDER' },
  })

  // Provider profile
  await prisma.providerProfile.upsert({
    where: { userId: provider.id },
    create: {
      userId: provider.id,
      category: 'PLUMBER',
      bio: 'Expert plumber with 8 years experience in Hyderabad',
      areasServed: ['Gachibowli', 'Kondapur', 'Madhapur'],
      experienceYears: 8,
      isVerified: true,
      isActive: true,
    },
    update: {},
  })
  console.log(`✅ Provider: ${provider.phone} — ${provider.name} (id: ${provider.id})`)

  // ── Properties ───────────────────────────────────────────────────────────────

  const prop1 = await prisma.property.upsert({
    where: { id: 'test-prop-001' },
    create: {
      id: 'test-prop-001',
      ownerId: owner.id,
      type: 'FLAT',
      listingFor: 'RENT',
      status: 'ACTIVE',
      title: '3BHK Premium Flat in Gachibowli',
      description: 'Spacious 3BHK flat in a gated community. Close to Mindspace IT park. 24/7 security, power backup, covered parking. Ready to move.',
      city: 'Hyderabad',
      locality: 'Gachibowli',
      addressDisplay: 'Near Mindspace IT Park, Gachibowli, Hyderabad',
      addressFull: 'Flat 4B, Skyline Residency, Road No. 12, Gachibowli, Hyderabad - 500032',
      pincode: '500032',
      latitude: 17.4401,
      longitude: 78.3489,
      monthlyRent: 35000,
      depositMonths: 2,
      depositAmount: 70000,
      maintenanceCharge: 3000,
      bhk: 3,
      bathrooms: 3,
      totalAreaSqft: 1850,
      carpetAreaSqft: 1550,
      floorNumber: 4,
      totalFloors: 12,
      ageYears: 3,
      facing: 'East',
      furnishing: 'SEMI_FURNISHED',
      parkingAvailable: true,
      petFriendly: false,
      amenities: ['Power Backup', 'Lift', 'Security', 'CCTV', 'Parking', 'Gym', 'Gated Community'],
      photos: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      ],
    },
    update: { status: 'ACTIVE' },
  })
  console.log(`✅ Property 1: ${prop1.title}`)

  const prop2 = await prisma.property.upsert({
    where: { id: 'test-prop-002' },
    create: {
      id: 'test-prop-002',
      ownerId: owner.id,
      type: 'FLAT',
      listingFor: 'RENT',
      status: 'ACTIVE',
      title: '2BHK Modern Apartment in Kondapur',
      description: 'Well-maintained 2BHK apartment with modular kitchen and wardrobes. Walking distance to Hitec City metro station.',
      city: 'Hyderabad',
      locality: 'Kondapur',
      addressDisplay: 'Near Hitec City Metro, Kondapur, Hyderabad',
      addressFull: 'Flat 201, Greenview Apartments, Kondapur Main Road, Kondapur, Hyderabad - 500084',
      pincode: '500084',
      latitude: 17.4566,
      longitude: 78.3625,
      monthlyRent: 22000,
      depositMonths: 2,
      depositAmount: 44000,
      maintenanceCharge: 1500,
      bhk: 2,
      bathrooms: 2,
      totalAreaSqft: 1100,
      carpetAreaSqft: 950,
      floorNumber: 2,
      totalFloors: 5,
      ageYears: 6,
      facing: 'West',
      furnishing: 'FULLY_FURNISHED',
      parkingAvailable: true,
      petFriendly: true,
      amenities: ['Power Backup', 'Lift', 'Security', 'Parking', 'Internet'],
      photos: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      ],
    },
    update: { status: 'ACTIVE' },
  })
  console.log(`✅ Property 2: ${prop2.title}`)

  const prop3 = await prisma.property.upsert({
    where: { id: 'test-prop-003' },
    create: {
      id: 'test-prop-003',
      ownerId: owner.id,
      type: 'VILLA',
      listingFor: 'SALE',
      status: 'ACTIVE',
      title: '4BHK Villa in Jubilee Hills',
      description: 'Luxurious 4BHK independent villa in prestigious Jubilee Hills. Private terrace, servant quarters, modular kitchen. Premium location near Road No. 36.',
      city: 'Hyderabad',
      locality: 'Jubilee Hills',
      addressDisplay: 'Near Road No. 36, Jubilee Hills, Hyderabad',
      addressFull: 'Plot 112, Road No. 36, Jubilee Hills, Hyderabad - 500033',
      pincode: '500033',
      latitude: 17.4326,
      longitude: 78.4072,
      salePrice: 25000000,
      bhk: 4,
      bathrooms: 5,
      totalAreaSqft: 4200,
      carpetAreaSqft: 3800,
      ageYears: 2,
      facing: 'North',
      furnishing: 'FULLY_FURNISHED',
      parkingAvailable: true,
      petFriendly: true,
      amenities: ['Power Backup', 'Security', 'CCTV', 'Parking', 'Garden', 'Swimming Pool'],
      photos: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      ],
    },
    update: { status: 'ACTIVE' },
  })
  console.log(`✅ Property 3: ${prop3.title}`)

  const prop4 = await prisma.property.upsert({
    where: { id: 'test-prop-004' },
    create: {
      id: 'test-prop-004',
      ownerId: owner.id,
      type: 'PG',
      listingFor: 'RENT',
      status: 'ACTIVE',
      title: 'Premium Co-living / PG for Working Professionals — Madhapur',
      description: 'AC rooms for working professionals. Meals included, WiFi, housekeeping. 2 sharing and single occupancy options. 5 min walk from Hitech City.',
      city: 'Hyderabad',
      locality: 'Madhapur',
      addressDisplay: 'Near Hitech City, Madhapur, Hyderabad',
      addressFull: 'H.No 4-50/23, Kavuri Hills Phase 2, Madhapur, Hyderabad - 500081',
      pincode: '500081',
      latitude: 17.4485,
      longitude: 78.3908,
      monthlyRent: 9500,
      depositMonths: 1,
      depositAmount: 9500,
      maintenanceCharge: 0,
      bhk: 1,
      bathrooms: 1,
      totalAreaSqft: 200,
      furnishing: 'FULLY_FURNISHED',
      parkingAvailable: false,
      petFriendly: false,
      genderPreference: 'ANY',
      amenities: ['WiFi', 'AC', 'Geyser', 'Laundry', 'Meals', 'Housekeeping', 'Power Backup', 'RO Water'],
      photos: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      ],
    },
    update: { status: 'ACTIVE' },
  })
  console.log(`✅ Property 4: ${prop4.title}`)

  const prop5 = await prisma.property.upsert({
    where: { id: 'test-prop-005' },
    create: {
      id: 'test-prop-005',
      ownerId: owner.id,
      type: 'FLAT',
      listingFor: 'RENT',
      status: 'PENDING_REVIEW',
      title: '1BHK Cozy Apartment in Kukatpally',
      description: 'Neat 1BHK apartment near KPHB colony. Newly painted. Good water supply. Close to JNTU and KPHB metro.',
      city: 'Hyderabad',
      locality: 'Kukatpally',
      addressDisplay: 'Near KPHB Colony, Kukatpally, Hyderabad',
      addressFull: 'Flat 3A, Sri Sai Residency, JNTU Road, Kukatpally, Hyderabad - 500072',
      pincode: '500072',
      latitude: 17.4948,
      longitude: 78.3996,
      monthlyRent: 12000,
      depositMonths: 2,
      depositAmount: 24000,
      maintenanceCharge: 800,
      bhk: 1,
      bathrooms: 1,
      totalAreaSqft: 650,
      carpetAreaSqft: 550,
      floorNumber: 3,
      totalFloors: 4,
      ageYears: 10,
      furnishing: 'UNFURNISHED',
      parkingAvailable: false,
      petFriendly: false,
      amenities: ['Water 24/7', 'Security'],
      photos: [],
    },
    update: { status: 'PENDING_REVIEW' },
  })
  console.log(`✅ Property 5: ${prop5.title} (PENDING_REVIEW — for admin approval test)`)

  // ── Broker assignment ────────────────────────────────────────────────────────

  const broker = await prisma.user.findUnique({ where: { phone: '9888888888' }, include: { brokerProfile: true } })
  if (broker?.brokerProfile) {
    await prisma.brokerAssignment.upsert({
      where: { propertyId_brokerProfileId: { propertyId: prop1.id, brokerProfileId: broker.brokerProfile.id } },
      create: { propertyId: prop1.id, brokerProfileId: broker.brokerProfile.id, isPrimary: true },
      update: {},
    })
    await prisma.brokerAssignment.upsert({
      where: { propertyId_brokerProfileId: { propertyId: prop2.id, brokerProfileId: broker.brokerProfile.id } },
      create: { propertyId: prop2.id, brokerProfileId: broker.brokerProfile.id, isPrimary: true },
      update: {},
    })
    console.log(`✅ Broker assigned to prop1 + prop2`)
  }

  // ── Saved property (seeker) ──────────────────────────────────────────────────

  await prisma.savedProperty.upsert({
    where: { userId_propertyId: { userId: seeker.id, propertyId: prop1.id } },
    create: { userId: seeker.id, propertyId: prop1.id },
    update: {},
  })
  await prisma.savedProperty.upsert({
    where: { userId_propertyId: { userId: seeker.id, propertyId: prop3.id } },
    create: { userId: seeker.id, propertyId: prop3.id },
    update: {},
  })
  console.log(`✅ Seeker saved prop1 + prop3`)

  // ── Booking (visit) ──────────────────────────────────────────────────────────

  const booking = await prisma.booking.upsert({
    where: { id: 'test-booking-001' },
    create: {
      id: 'test-booking-001',
      seekerId: seeker.id,
      propertyId: prop2.id,
      brokerProfileId: broker?.brokerProfile?.id,
      type: 'VISIT',
      status: 'CONFIRMED',
      scheduledAt: new Date('2026-07-05T11:00:00'),
      notes: 'Looking for 2BHK for myself. Flexible on move-in date.',
    },
    update: {},
  })
  console.log(`✅ Booking (visit confirmed) for prop2`)

  // ── Active Lease + Rent Payments ────────────────────────────────────────────

  const seeker2 = await prisma.user.upsert({
    where: { phone: '9444444444' },
    create: {
      phone: '9444444444',
      name: 'Arjun Nair',
      email: 'tenant2@test.com',
      role: 'SEEKER',
      isActive: true,
    },
    update: { role: 'SEEKER' },
  })
  console.log(`✅ Tenant 2: ${seeker2.phone} — ${seeker2.name}`)

  // Mark prop2 as RENTED since it has a lease
  await prisma.property.update({ where: { id: prop2.id }, data: { status: 'RENTED' } })

  const lease = await prisma.lease.upsert({
    where: { id: 'test-lease-001' },
    create: {
      id: 'test-lease-001',
      propertyId: prop2.id,
      tenantId: seeker2.id,
      brokerProfileId: broker?.brokerProfile?.id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2027-04-30'),
      monthlyRent: 22000,
      depositAmount: 44000,
      depositStatus: 'HELD',
      status: 'ACTIVE',
    },
    update: {},
  })
  console.log(`✅ Active lease for prop2 (tenant: Arjun)`)

  // Rent payments: 2 paid, 1 overdue, 1 upcoming
  const payments = [
    { id: 'rp-001', month: 5, year: 2026, status: 'PAID' as const, paidAt: new Date('2026-05-03') },
    { id: 'rp-002', month: 6, year: 2026, status: 'PAID' as const, paidAt: new Date('2026-06-04') },
    { id: 'rp-003', month: 7, year: 2026, status: 'OVERDUE' as const, paidAt: null },
    { id: 'rp-004', month: 8, year: 2026, status: 'PENDING' as const, paidAt: null },
  ]
  for (const p of payments) {
    await prisma.rentPayment.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        leaseId: lease.id,
        tenantId: seeker2.id,
        amount: 22000,
        dueDate: new Date(`${p.year}-${String(p.month).padStart(2, '0')}-05`),
        status: p.status,
        paidAt: p.paidAt,
      },
      update: {},
    })
  }
  console.log(`✅ Rent payments: 2 paid, 1 overdue, 1 pending`)

  // ── Maintenance Request ──────────────────────────────────────────────────────

  await prisma.maintenanceRequest.upsert({
    where: { id: 'test-maint-001' },
    create: {
      id: 'test-maint-001',
      propertyId: prop2.id,
      tenantId: seeker2.id,
      category: 'PLUMBING',
      description: 'Kitchen sink is leaking. Water pooling under the cabinet.',
      status: 'OPEN',
      priority: 'HIGH',
      paidBy: 'OWNER',
      photos: [],
    },
    update: {},
  })
  console.log(`✅ Maintenance request (plumbing) for prop2`)

  // ── Notifications ────────────────────────────────────────────────────────────

  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: owner.id,
        type: 'RENT_DUE',
        title: 'Rent overdue',
        body: 'Arjun Nair\'s rent for July is overdue. ₹22,000 pending.',
        data: { leaseId: lease.id, propertyId: prop2.id },
        isRead: false,
      },
      {
        userId: owner.id,
        type: 'MAINTENANCE_REQUEST',
        title: 'New maintenance request',
        body: 'Tenant raised a plumbing issue in "2BHK Modern Apartment in Kondapur"',
        data: { propertyId: prop2.id },
        isRead: false,
      },
      {
        userId: seeker.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Visit confirmed!',
        body: 'Your visit to "2BHK Modern Apartment in Kondapur" is confirmed for July 5 at 11 AM.',
        data: { bookingId: booking.id },
        isRead: false,
      },
      {
        userId: seeker2.id,
        type: 'RENT_DUE',
        title: 'Rent overdue — July 2026',
        body: 'Your rent of ₹22,000 for July 2026 is overdue. Please pay immediately.',
        data: { leaseId: lease.id },
        isRead: false,
      },
    ],
  })
  console.log(`✅ Sample notifications created`)

  // ── Property Views ───────────────────────────────────────────────────────────

  for (const [propId, count] of [['test-prop-001', 47], ['test-prop-002', 23], ['test-prop-003', 89], ['test-prop-004', 31]] as [string, number][]) {
    // Create view records (just a few, not all 47 — to keep seed fast)
    await prisma.propertyView.createMany({
      skipDuplicates: true,
      data: Array.from({ length: Math.min(count, 3) }, () => ({
        propertyId: propId,
        userId: seeker.id,
      })),
    })
  }
  console.log(`✅ Property views seeded`)

  console.log('\n🎉 Test seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Test logins (enter these phones in OTP screen):')
  console.log('  Admin:       9999999999')
  console.log('  Owner:       9111111111')
  console.log('  Seeker 1:    9222222222  (has saved properties, 1 booking)')
  console.log('  Seeker 2:    9444444444  (has active lease, rent payments, maintenance)')
  console.log('  Broker:      9888888888  (assigned to prop1 + prop2)')
  console.log('  Provider:    9333333333  (plumber, Gachibowli)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nProperties:')
  console.log('  ACTIVE:         3BHK Gachibowli (35k rent), 2BHK Kondapur (22k, RENTED), Jubilee Hills Villa (2.5Cr sale), PG Madhapur (9.5k)')
  console.log('  PENDING_REVIEW: 1BHK Kukatpally — login as Admin → Approvals to review')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
