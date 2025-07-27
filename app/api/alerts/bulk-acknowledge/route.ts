import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { alertIds } = await request.json()

    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json({ error: 'Invalid alert IDs' }, { status: 400 })
    }

    // Bulk acknowledge alerts for this user only (security check)
    const { data, error } = await supabase
      .from('alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .in('id', alertIds)
      .eq('user_id', user.id)
      .select('id')

    if (error) {
      console.error('Error bulk acknowledging alerts:', error)
      return NextResponse.json({ error: 'Failed to acknowledge alerts' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      acknowledgedCount: data?.length || 0 
    })
  } catch (error) {
    console.error('Error in bulk acknowledge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}