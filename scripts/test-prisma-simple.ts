// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testSimple() {
  console.log('🔍 Testing basic Prisma connection...\n')

  try {
    console.log('Environment check:')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 20) + '...')
    
    console.log('\n1. Testing $connect...')
    await prisma.$connect()
    console.log('✅ Prisma $connect successful')

    console.log('\n2. Testing raw query...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Raw query successful:', result)

    console.log('\n3. Testing table existence...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('✅ Tables found:', tables)

    console.log('\n🎉 Basic Prisma connection test passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testSimple()