import { createServerClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'
import { AIService } from '@/lib/ai/ai-service' // Updated import

type Alert = Database['public']['Tables']['alerts']['Row']
type AlertInsert = Database['public']['Tables']['alerts']['Insert']

export class AlertService {
  private supabase = createServerClient()

  async createAlert(alert: AlertInsert): Promise<Alert> {
    const { data, error } = await this.supabase
      .from('alerts')
      .insert(alert)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getAlerts(userId: string, limit: number = 20): Promise<Alert[]> {
    const { data, error } = await this.supabase
      .from('alerts')
      .select(`
        *,
        containers:container_id (container_id, status, current_location)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async checkContainerForAlerts(containerId: string): Promise<void> {
    const { data: container } = await this.supabase
      .from('containers')
      .select('*')
      .eq('id', containerId)
      .single()

    if (!container) return

    // Use OpenAI as the only provider (ai_provider column doesn't exist)
    const preferredProvider = 'openai' as const

    // Check for delay alerts
    if (container.delay_hours > 12) {
      const severity = container.delay_hours > 48 ? 'High' : 'Medium'
      
      const message = await AIService.generateAlertMessage({
        container_id: container.container_id,
        status: container.status,
        current_location: container.current_location || undefined,
        delay_hours: container.delay_hours,
        carrier: container.carrier || undefined,
        issues: container.issues || undefined,
      }, 'delay', preferredProvider)

      await this.createAlert({
        container_id: containerId,
        user_id: container.user_id,
        alert_type: 'delay',
        severity,
        title: `Container ${container.container_id} Delayed`,
        message,
        ai_generated: true
      })
    }

    // Check for high-risk alerts
    if (container.issues && container.issues.length > 0) {
      const message = await AIService.generateAlertMessage({
        container_id: container.container_id,
        status: container.status,
        current_location: container.current_location || undefined,
        delay_hours: container.delay_hours,
        carrier: container.carrier || undefined,
        issues: container.issues || undefined,
      }, 'issue', preferredProvider)

      await this.createAlert({
        container_id: containerId,
        user_id: container.user_id,
        alert_type: 'issue',
        severity: 'Medium',
        title: `Container ${container.container_id} Issue Detected`,
        message,
        ai_generated: true
      })
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.supabase
      .from('alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', alertId)
  }
}