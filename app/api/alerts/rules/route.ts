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
    const rules = alertService.getRules()

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Error fetching alert rules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ruleId, enabled } = await request.json()

    if (!ruleId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
    }

    const alertService = new AlertService()
    const success = alertService.updateRuleStatus(ruleId, enabled)

    if (!success) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating alert rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}