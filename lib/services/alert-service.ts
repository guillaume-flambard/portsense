import { createServerClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'
import { AIService } from '@/lib/ai/ai-service'
import { AlertRulesEngine, AlertTrigger } from './alert-rules-engine'
import { containers } from '@/lib/generated/prisma'

type Alert = Database['public']['Tables']['alerts']['Row']
type AlertInsert = Database['public']['Tables']['alerts']['Insert']

export class AlertService {
  private supabase = createServerClient()
  private rulesEngine = AlertRulesEngine.getInstance()

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

    // Evaluate container against all alert rules
    const triggers = this.rulesEngine.evaluateContainer(container as containers)
    
    if (triggers.length === 0) return

    // Check for cooldown periods to avoid spam
    const recentAlerts = await this.getRecentAlertsForContainer(containerId)
    const filteredTriggers = await this.filterTriggersWithCooldown(triggers, recentAlerts)

    // Create alerts for valid triggers
    for (const trigger of filteredTriggers) {
      await this.createAlertFromTrigger(trigger, container)
    }
  }

  private async getRecentAlertsForContainer(containerId: string): Promise<Alert[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: alerts, error } = await this.supabase
      .from('alerts')
      .select('*')
      .eq('container_id', containerId)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recent alerts:', error)
      return []
    }

    return alerts || []
  }

  private async filterTriggersWithCooldown(
    triggers: AlertTrigger[], 
    recentAlerts: Alert[]
  ): Promise<AlertTrigger[]> {
    return triggers.filter(trigger => {
      const cooldownHours = trigger.metadata?.cooldownHours || 1
      const cooldownTime = Date.now() - (cooldownHours * 60 * 60 * 1000)

      // Check if there's a recent alert of the same type for this rule
      const hasRecentAlert = recentAlerts.some(alert => {
        const alertTime = new Date(alert.created_at).getTime()
        return (
          alertTime > cooldownTime &&
          alert.alert_type === trigger.alertType &&
          alert.title.includes(trigger.title.split(' ')[1]) // Match container ID
        )
      })

      return !hasRecentAlert
    })
  }

  private async createAlertFromTrigger(trigger: AlertTrigger, container: any): Promise<void> {
    // Use AI to enhance the alert message if desired
    const preferredProvider = 'openai' as const
    let enhancedMessage = trigger.message

    try {
      enhancedMessage = await AIService.generateAlertMessage({
        container_id: container.container_id,
        status: container.status,
        current_location: container.current_location || undefined,
        delay_hours: container.delay_hours,
        carrier: container.carrier || undefined,
        issues: container.issues || undefined,
      }, trigger.alertType, preferredProvider)
    } catch (error) {
      console.warn('Failed to generate AI message, using default:', error)
      // Fall back to the original message from the trigger
    }

    await this.createAlert({
      container_id: trigger.containerId,
      user_id: container.user_id,
      alert_type: trigger.alertType,
      severity: trigger.severity,
      title: trigger.title,
      message: enhancedMessage,
      ai_generated: true
    })

    console.log(`Created alert for container ${container.container_id}: ${trigger.title}`)
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.supabase
      .from('alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', alertId)
  }

  // Alert rules management methods
  getRules() {
    return this.rulesEngine.getRules()
  }

  updateRuleStatus(ruleId: string, enabled: boolean) {
    return enabled 
      ? this.rulesEngine.enableRule(ruleId)
      : this.rulesEngine.disableRule(ruleId)
  }

  // Get alert statistics
  async getAlertStats(userId: string): Promise<{
    total: number
    unread: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
  }> {
    const { data: alerts, error } = await this.supabase
      .from('alerts')
      .select('alert_type, severity, acknowledged_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (error) {
      console.error('Error fetching alert stats:', error)
      return { total: 0, unread: 0, byType: {}, bySeverity: {} }
    }

    const stats = {
      total: alerts?.length || 0,
      unread: alerts?.filter(a => !a.acknowledged_at).length || 0,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    }

    alerts?.forEach(alert => {
      // Count by type
      if (alert.alert_type) {
        stats.byType[alert.alert_type] = (stats.byType[alert.alert_type] || 0) + 1
      }
      
      // Count by severity
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1
    })

    return stats
  }
}