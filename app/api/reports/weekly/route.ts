import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ContainerService } from '@/lib/services/container-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const containerService = new ContainerService()
    const report = await containerService.generateWeeklyReport(user.id)

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error generating weekly report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}