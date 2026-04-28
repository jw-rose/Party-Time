import { db } from '@/src/server/db/index'

async function seed() {
  console.log('🌱 Seeding database...')

  // Add seed data here in Week 3+

  console.log('✅ Done')
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})