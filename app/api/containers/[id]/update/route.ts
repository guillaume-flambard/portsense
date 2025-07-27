import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { RealTimeContainerService } from '@/lib/services/real-time-container-service'
import { z } from 'zod'

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic'

const containerUpdateSchema = z.object({
  status: z.string().optional(),
  current_location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  eta: z.string().transform(val => val ? new Date(val) : undefined).optional(),
  delay_hours: z.number().optional(),
  risk_level: z.enum(['Low', 'Medium', 'High']).optional(),
  vessel_name: z.string().optional(),
  voyage_number: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const validatedData = containerUpdateSchema.parse(body)

    // Update container using real-time service
    const updatedContainer = await RealTimeContainerService.updateContainer(
      params.id,
      validatedData,
      user.id
    )

    // Check and create alerts if needed
    await RealTimeContainerService.checkAndCreateAlerts(updatedContainer)

    return NextResponse.json({
      success: true,
      container: updatedContainer,
      message: 'Container updated successfully'
    })

  } catch (error) {
    console.error('Container update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized to update this container' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update container' },
      { status: 500 }
    )
  }
}