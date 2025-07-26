import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { RealTimeContainerService, BulkContainerUpdateData } from '@/lib/services/real-time-container-service'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
  updates: z.array(z.object({
    container_id: z.string(),
    status: z.string().optional(),
    current_location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    eta: z.string().transform(val => val ? new Date(val) : undefined).optional(),
    delay_hours: z.number().optional(),
    risk_level: z.enum(['Low', 'Medium', 'High']).optional(),
    vessel_name: z.string().optional(),
    voyage_number: z.string().optional()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { updates } = bulkUpdateSchema.parse(body)

    // Perform bulk update
    const updatedContainers = await RealTimeContainerService.bulkUpdateContainers(updates)

    // Check and create alerts for all updated containers
    for (const container of updatedContainers) {
      await RealTimeContainerService.checkAndCreateAlerts(container)
    }

    return NextResponse.json({
      success: true,
      updated: updatedContainers.length,
      total: updates.length,
      containers: updatedContainers,
      message: `Successfully updated ${updatedContainers.length} of ${updates.length} containers`
    })

  } catch (error) {
    console.error('Bulk update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to perform bulk update' },
      { status: 500 }
    )
  }
}

// Get bulk update status
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get container status summary
    const summary = await RealTimeContainerService.getContainerStatusSummary(user.id)

    return NextResponse.json({
      success: true,
      summary
    })

  } catch (error) {
    console.error('Status summary error:', error)
    return NextResponse.json(
      { error: 'Failed to get container status summary' },
      { status: 500 }
    )
  }
}