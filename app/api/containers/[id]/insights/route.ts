import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { OpenAIService } from '@/lib/ai/openai-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: container } = await supabase
      .from('containers')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!container) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 })
    }

    const insight = await OpenAIService.generateDelayInsight({
      container_id: container.container_id,
      status: container.status,
      current_location: container.current_location || undefined,
      origin_port: container.origin_port || undefined,
      destination_port: container.destination_port || undefined,
      eta: container.eta || undefined,
      delay_hours: container.delay_hours,
      carrier: container.carrier || undefined,
      issues: container.issues || undefined,
      vessel_name: container.vessel_name || undefined,
    })

    return NextResponse.json({ insight })
  } catch (error) {
    console.error('Error generating insight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}