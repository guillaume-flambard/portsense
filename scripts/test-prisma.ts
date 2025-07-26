// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma connection and database operations...\n')

  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful\n')

    // Test 2: Query existing tables
    console.log('2. Testing table queries...')
    
    // Test containers table
    const containerCount = await prisma.container.count()
    console.log(`📦 Containers table: ${containerCount} records`)

    // Test alerts table
    const alertCount = await prisma.alert.count()
    console.log(`🚨 Alerts table: ${alertCount} records`)

    // Test container_history table
    const historyCount = await prisma.containerHistory.count()
    console.log(`📋 Container history table: ${historyCount} records`)

    // Test user_preferences table
    const preferencesCount = await prisma.userPreferences.count()
    console.log(`⚙️ User preferences table: ${preferencesCount} records`)

    // Test profiles table
    const profileCount = await prisma.profile.count()
    console.log(`👤 Profiles table: ${profileCount} records`)

    // Test chat_messages table
    const chatCount = await prisma.chatMessage.count()
    console.log(`💬 Chat messages table: ${chatCount} records\n`)

    // Test 3: Sample data retrieval
    console.log('3. Testing sample data retrieval...')
    
    // Get first few containers with relations
    const containers = await prisma.container.findMany({
      take: 3,
      include: {
        alerts: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    if (containers.length > 0) {
      console.log(`📦 Retrieved ${containers.length} containers:`)
      containers.forEach((container, index) => {
        console.log(`   ${index + 1}. ${container.container_id} - ${container.status} (${container.alerts.length} alerts)`)
      })
    } else {
      console.log('📦 No containers found in database')
    }

    // Test 4: Schema validation
    console.log('\n4. Testing schema validation...')
    const rawResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('containers', 'alerts', 'container_history', 'user_preferences', 'profiles', 'chat_messages')
      ORDER BY table_name
    `
    console.log('✅ Database tables found:', rawResult)

    console.log('\n🎉 All Prisma tests passed successfully!')

  } catch (error) {
    console.error('❌ Prisma test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testPrismaConnection()
  .catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })