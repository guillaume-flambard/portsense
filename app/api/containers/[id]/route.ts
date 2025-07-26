import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ContainerService } from '@/lib/services/container-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const containerService = new ContainerService()
    const container = await containerService.getContainer(params.id, user.id)

    if (!container) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 })
    }

    const history = await containerService.getContainerHistory(params.id)

    return NextResponse.json({ container, history })
  } catch (error) {
    console.error('Error fetching container:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const containerService = new ContainerService()
    
    const updatedContainer = await containerService.updateContainer(params.id, body)

    return NextResponse.json({ container: updatedContainer })
  } catch (error) {
    console.error('Error updating container:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}