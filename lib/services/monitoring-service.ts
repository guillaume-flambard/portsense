import { createServerClient } from '@/lib/supabase/server'
import { ContainerService } from './container-service'
import { AlertService } from './alert-service'
import { NotificationService } from './notification-service'
import { MarineTrackingAPI } from '@/lib/mock-data/marine-api'

export class MonitoringService {
  private supabase = createServerClient()
  private containerService = new ContainerService()
  private alertService = new AlertService()

  async updateAllContainers(): Promise<void> {
    console.log('🔄 Starting container monitoring cycle...')

    try {
      // Get all active containers
      const { data: containers, error } = await this.supabase
        .from('containers')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching containers:', error)
        return
      }

      if (!containers || containers.length === 0) {
        console.log('No containers to monitor')
        return
      }

      console.log(`Monitoring ${containers.length} containers...`)

      // Process containers in batches to avoid API rate limits
      const batchSize = 5
      for (let i = 0; i < containers.length; i += batchSize) {
        const batch = containers.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(container => this.updateContainer(container))
        )

        // Small delay between batches
        if (i + batchSize < containers.length) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      console.log('✅ Container monitoring cycle completed')
    } catch (error) {
      console.error('Error in monitoring cycle:', error)
    }
  }

  private async updateContainer(container: any): Promise<void> {
    try {
      // Fetch latest data from marine API
      const marineData = await MarineTrackingAPI.trackContainer(container.container_id)

      if (!marineData) {
        console.log(`No data available for container ${container.container_id}`)
        return
      }

      // Calculate delay
      const originalETA = container.original_eta ? new Date(container.original_eta) : null
      const newETA = new Date(marineData.eta)
      const delayHours = originalETA 
        ? Math.max(0, Math.floor((newETA.getTime() - originalETA.getTime()) / (1000 * 60 * 60)))
        : 0

      // Determine risk level
      let riskLevel = 'Low'
      if (delayHours > 48) riskLevel = 'High'
      else if (delayHours > 12) riskLevel = 'Medium'

      // Detect issues
      const issues: string[] = []
      if (delayHours > 24) issues.push('Significant delay')
      if (marineData.location.port.toLowerCase().includes('congestion')) {
        issues.push('Port congestion')
      }

      // Check if significant changes occurred
      const hasSignificantChanges = 
        container.status !== marineData.status ||
        container.current_location !== marineData.location.port ||
        Math.abs(container.delay_hours - delayHours) >= 6

      if (hasSignificantChanges) {
        // Update container in database
        await this.containerService.updateContainer(container.id, {
          status: marineData.status,
          current_location: marineData.location.port,
          latitude: marineData.location.latitude,
          longitude: marineData.location.longitude,
          eta: marineData.eta,
          delay_hours: delayHours,
          risk_level: riskLevel,
          issues: issues.length > 0 ? issues : null,
        })

        // Check for new alerts
        await this.alertService.checkContainerForAlerts(container.id)

        console.log(`Updated container ${container.container_id} - Status: ${marineData.status}, Delay: ${delayHours}h`)
      }
    } catch (error) {
      console.error(`Error updating container ${container.container_id}:`, error)
    }
  }

  async processAlerts(): Promise<void> {
    console.log('📢 Processing alert notifications...')

    try {
      // Get unprocessed alerts
      const { data: alerts, error } = await this.supabase
        .from('alerts')
        .select(`
          *,
          containers:container_id (*)
        `)
        .eq('email_sent', false)
        .limit(20)

      if (error) {
        console.error('Error fetching alerts:', error)
        return
      }

      if (!alerts || alerts.length === 0) {
        console.log('No alerts to process')
        return
      }

      for (const alert of alerts) {
        await this.processAlert(alert)
      }

      console.log(`✅ Processed ${alerts.length} alerts`)
    } catch (error) {
      console.error('Error processing alerts:', error)
    }
  }

  private async processAlert(alert: any): Promise<void> {
    try {
      // Get user email and preferences
      const { data: { user } } = await this.supabase.auth.admin.getUserById(alert.user_id)
      
      if (!user?.email) {
        console.error(`No email found for user ${alert.user_id}`)
        return
      }

      const { data: preferences } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', alert.user_id)
        .single()

      // Send notifications
      const results = await NotificationService.sendNotifications(
        alert.user_id,
        user.email,
        alert,
        alert.containers,
        preferences
      )

      // Update alert status
      await this.supabase
        .from('alerts')
        .update({
          email_sent: results.email,
          sms_sent: results.sms,
          slack_sent: results.slack,
        })
        .eq('id', alert.id)

      console.log(`Sent notifications for alert ${alert.id}:`, results)
    } catch (error) {
      console.error(`Error processing alert ${alert.id}:`, error)
    }
  }

  // Method to run complete monitoring cycle
  async runMonitoringCycle(): Promise<void> {
    console.log('🚀 Starting complete monitoring cycle...')
    
    await this.updateAllContainers()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await this.processAlerts()
    
    console.log('🏁 Complete monitoring cycle finished')
  }
}