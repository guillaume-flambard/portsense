import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { AlertService } from '@/lib/services/alert-service'

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertService = new AlertService()
    const stats = await alertService.getAlertStats(user.id)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching alert stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}