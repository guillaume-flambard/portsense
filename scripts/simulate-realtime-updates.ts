#!/usr/bin/env tsx

/**
 * Script to simulate real-time container updates
 * This will update container positions, statuses, and other data to demonstrate real-time functionality
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Simulation data
const statuses = ['In transit', 'Loading', 'Unloading', 'Delayed', 'At destination', 'Delivered']
const locations = [
  'Port of Rotterdam', 'Port of Hamburg', 'Port of Antwerp', 'Port of Le Havre',
  'Port of Barcelona', 'Port of Genoa', 'Port of Piraeus', 'Port of Valencia',
  'Atlantic Ocean', 'North Sea', 'Mediterranean Sea', 'English Channel'
]

const riskLevels = ['Low', 'Medium', 'High']

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomCoordinates() {
  // Generate coordinates in European/Atlantic region
  const lat = 35 + Math.random() * 20 // 35 to 55 (Europe)
  const lng = -20 + Math.random() * 40 // -20 to 20 (Atlantic to Europe)
  return { latitude: lat, longitude: lng }
}

async function updateRandomContainer() {
  try {
    // Get all containers
    const { data: containers, error } = await supabase
      .from('containers')
      .select('*')
      .limit(50)

    if (error) {
      console.error('Error fetching containers:', error)
      return
    }

    if (!containers || containers.length === 0) {
      console.log('No containers found')
      return
    }

    // Pick a random container
    const container = getRandomItem(containers)
    const { latitude, longitude } = generateRandomCoordinates()
    
    const updates = {
      status: getRandomItem(statuses),
      current_location: getRandomItem(locations),
      latitude: latitude,
      longitude: longitude,
      delay_hours: Math.random() > 0.7 ? Math.floor(Math.random() * 24) : 0,
      risk_level: getRandomItem(riskLevels),
      last_updated: new Date().toISOString(),
      eta: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random ETA within 7 days
    }

    // Update the container
    const { error: updateError } = await supabase
      .from('containers')
      .update(updates)
      .eq('id', container.id)

    if (updateError) {
      console.error('Error updating container:', updateError)
      return
    }

    console.log(`✅ Updated container ${container.container_id}:`)
    console.log(`   Status: ${updates.status}`)
    console.log(`   Location: ${updates.current_location}`)
    console.log(`   Coordinates: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
    console.log(`   Risk: ${updates.risk_level}`)
    if (updates.delay_hours > 0) {
      console.log(`   Delay: ${updates.delay_hours} hours`)
    }
    console.log(`   Updated at: ${updates.last_updated}`)
    console.log('')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

async function startSimulation() {
  console.log('🚀 Starting real-time container simulation...')
  console.log('This will update container data every 3 seconds')
  console.log('Press Ctrl+C to stop\n')

  // Update immediately
  await updateRandomContainer()

  // Set up interval for continuous updates
  const interval = setInterval(async () => {
    await updateRandomContainer()
  }, 3000) // Update every 3 seconds

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping simulation...')
    clearInterval(interval)
    process.exit(0)
  })
}

// Start the simulation
startSimulation().catch(console.error)