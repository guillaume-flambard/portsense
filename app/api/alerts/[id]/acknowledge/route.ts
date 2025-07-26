import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { AlertService } from '@/lib/services/alert-service'

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

    const alertService = new AlertService()
    await alertService.acknowledgeAlert(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error acknowledging alert:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}