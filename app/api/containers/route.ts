// app/api/containers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ContainerService } from '@/lib/services/container-service'
import { MarineTrackingAPI } from '@/lib/mock-data/marine-api'

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const containerService = new ContainerService()
    const containers = await containerService.getContainers(user.id)

    return NextResponse.json({ containers })
  } catch (error) {
    console.error('Error fetching containers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { container_id, carrier, origin_port, destination_port } = body

    if (!container_id) {
      return NextResponse.json({ error: 'Container ID is required' }, { status: 400 })
    }

    const containerService = new ContainerService()
    
    // Try to fetch real data from marine API
    const marineData = await MarineTrackingAPI.trackContainer(container_id)
    
    let containerData
    if (marineData) {
      containerData = await containerService.createContainer({
        user_id: user.id,
        container_id,
        carrier: carrier || marineData.vessel.name,
        vessel_name: marineData.vessel.name,
        voyage_number: marineData.voyage,
        status: marineData.status,
        current_location: marineData.location.port,
        origin_port: origin_port || marineData.last_port,
        destination_port: destination_port || marineData.next_port,
        latitude: marineData.location.latitude,
        longitude: marineData.location.longitude,
        eta: marineData.eta,
        original_eta: marineData.eta,
        delay_hours: 0,
        risk_level: 'Low'
      })
    } else {
      // Fallback to basic tracking
      containerData = await containerService.trackNewContainer(user.id, {
        container_id,
        carrier,
        origin_port,
        destination_port
      })
    }

    return NextResponse.json({ container: containerData }, { status: 201 })
  } catch (error) {
    console.error('Error creating container:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
