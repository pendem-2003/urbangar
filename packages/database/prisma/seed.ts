import { PrismaClient } from '@prisma/client'
import { DEFAULT_PLATFORM_CONFIG } from '@urbangar/config'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed platform config from defaults
  for (const [key, value] of Object.entries(DEFAULT_PLATFORM_CONFIG)) {
    const type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string'
    await prisma.platformConfig.upsert({
      where: { key },
      create: { key, value: String(value), type },
      update: { value: String(value), type },
    })
  }
  console.log('✅ Platform config seeded')

  // Seed admin user
  const admin = await prisma.user.upsert({
    where: { phone: '9999999999' },
    create: {
      phone: '9999999999',
      name: 'UrbanGar Admin',
      role: 'ADMIN',
      email: 'admin@urbangar.com',
    },
    update: {},
  })
  console.log(`✅ Admin user: ${admin.phone}`)

  // Seed a test broker
  const broker = await prisma.user.upsert({
    where: { phone: '9888888888' },
    create: {
      phone: '9888888888',
      name: 'Ravi Kumar',
      role: 'BROKER',
      brokerProfile: {
        create: {
          reraNumber: 'RERA/TS/2024/001',
          experienceYears: 5,
          bio: 'Experienced broker specialising in Gachibowli and Kondapur',
          serviceAreas: ['Gachibowli', 'Kondapur', 'Madhapur', 'Hitech City'],
          isVerified: true,
        },
      },
    },
    update: {},
  })
  console.log(`✅ Broker user: ${broker.phone}`)

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
