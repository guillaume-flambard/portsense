import { createServerClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'
import { AIService } from '@/lib/ai/ai-service' // Updated import

type Container = Database['public']['Tables']['containers']['Row']
type ContainerInsert = Database['public']['Tables']['containers']['Insert']
type ContainerUpdate = Database['public']['Tables']['containers']['Update']

export class ContainerService {
  private supabase = createServerClient()

  async getContainers(userId: string): Promise<Container[]> {
    const { data, error } = await this.supabase
      .from('containers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getContainer(id: string, userId: string): Promise<Container | null> {
    const { data, error } = await this.supabase
      .from('containers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  }

  async createContainer(containerData: ContainerInsert): Promise<Container> {
    const { data, error } = await this.supabase
      .from('containers')
      .insert(containerData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateContainer(id: string, updates: ContainerUpdate): Promise<Container> {
    const { data, error } = await this.supabase
      .from('containers')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async trackNewContainer(userId: string, trackingData: {
    container_id: string
    carrier?: string
    origin_port?: string
    destination_port?: string
  }): Promise<Container> {
    const containerData: ContainerInsert = {
      user_id: userId,
      container_id: trackingData.container_id,
      carrier: trackingData.carrier || null,
      origin_port: trackingData.origin_port || null,
      destination_port: trackingData.destination_port || null,
      status: 'In Transit',
      risk_level: 'Low',
      delay_hours: 0,
      is_active: true
    }

    return this.createContainer(containerData)
  }

  async getContainerHistory(containerId: string): Promise<Database['public']['Tables']['container_history']['Row'][]> {
    const { data, error } = await this.supabase
      .from('container_history')
      .select('*')
      .eq('container_id', containerId)
      .order('recorded_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async updateAISummary(containerId: string, preferredProvider?: 'openai'): Promise<void> {
    const { data: container } = await this.supabase
      .from('containers')
      .select('*')
      .eq('id', containerId)
      .single()

    if (container) {
      const summary = await AIService.generateStatusSummary({
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
      }, preferredProvider)

      await this.supabase
        .from('containers')
        .update({ ai_summary: summary })
        .eq('id', containerId)
    }
  }

  async generateWeeklyReport(userId: string, preferredProvider?: 'openai'): Promise<string> {
    const containers = await this.getContainers(userId)
    
    // Filter to last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const recentContainers = containers.filter(c => 
      c.last_updated && new Date(c.last_updated) >= weekAgo
    )

    const containerData = recentContainers.map(c => ({
      container_id: c.container_id,
      status: c.status,
      current_location: c.current_location || undefined,
      delay_hours: c.delay_hours,
      carrier: c.carrier || undefined,
      issues: c.issues || undefined,
    }))

    return AIService.generateWeeklyReport(containerData, preferredProvider)
  }
}