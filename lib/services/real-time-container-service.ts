import { PrismaClient } from '@/lib/generated/prisma'
import { containers as Container } from '@/lib/generated/prisma'

export interface ContainerUpdateData {
  container_id?: string // Optional for direct updates, required for bulk updates
  status?: string
  current_location?: string
  latitude?: number
  longitude?: number
  eta?: Date
  delay_hours?: number
  risk_level?: string
  vessel_name?: string
  voyage_number?: string
}

export interface BulkContainerUpdateData {
  container_id: string // Required for bulk updates
  status?: string
  current_location?: string
  latitude?: number
  longitude?: number
  eta?: Date
  delay_hours?: number
  risk_level?: string
  vessel_name?: string
  voyage_number?: string
}

export interface ContainerStatusChange {
  container: Container
  previousStatus: string
  newStatus: string
  timestamp: Date
  changeType: 'location' | 'status' | 'delay' | 'risk'
}

export class RealTimeContainerService {
  private static prisma = new PrismaClient()
  private static updateListeners: ((change: ContainerStatusChange) => void)[] = []

  // Subscribe to container updates
  static addUpdateListener(callback: (change: ContainerStatusChange) => void) {
    this.updateListeners.push(callback)
    return () => {
      this.updateListeners = this.updateListeners.filter(listener => listener !== callback)
    }
  }

  // Broadcast changes to all listeners
  private static notifyListeners(change: ContainerStatusChange) {
    this.updateListeners.forEach(listener => {
      try {
        listener(change)
      } catch (error) {
        console.error('Error in update listener:', error)
      }
    })
  }

  // Update container with real-time notifications
  static async updateContainer(
    containerId: string, 
    updates: ContainerUpdateData,
    userId?: string
  ): Promise<Container> {
    // Get current container state
    const currentContainer = await this.prisma.containers.findUnique({
      where: { id: containerId }
    })

    if (!currentContainer) {
      throw new Error(`Container ${containerId} not found`)
    }

    // Check if user has permission (if userId provided)
    if (userId && currentContainer.user_id !== userId) {
      throw new Error('Unauthorized to update this container')
    }

    // Determine change type and previous values
    let changeType: 'location' | 'status' | 'delay' | 'risk' = 'status'
    let previousStatus = currentContainer.status

    if (updates.current_location && updates.current_location !== currentContainer.current_location) {
      changeType = 'location'
    } else if (updates.delay_hours !== undefined && updates.delay_hours !== currentContainer.delay_hours) {
      changeType = 'delay'
    } else if (updates.risk_level && updates.risk_level !== currentContainer.risk_level) {
      changeType = 'risk'
    }

    // Update container in database
    const updatedContainer = await this.prisma.containers.update({
      where: { id: containerId },
      data: {
        ...updates,
        last_updated: new Date(),
        updated_at: new Date()
      }
    })

    // Create container history entry
    await this.prisma.container_history.create({
      data: {
        container_id: containerId,
        status: updates.status || currentContainer.status,
        location: updates.current_location || currentContainer.current_location,
        latitude: updates.latitude,
        longitude: updates.longitude,
        eta: updates.eta,
        delay_hours: updates.delay_hours || currentContainer.delay_hours,
        recorded_at: new Date()
      }
    })

    // Notify listeners of the change
    const statusChange: ContainerStatusChange = {
      container: updatedContainer,
      previousStatus,
      newStatus: updatedContainer.status,
      timestamp: new Date(),
      changeType
    }

    this.notifyListeners(statusChange)

    return updatedContainer
  }

  // Bulk update multiple containers (for external API integration)
  static async bulkUpdateContainers(updates: BulkContainerUpdateData[]): Promise<Container[]> {
    const results: Container[] = []

    for (const update of updates) {
      try {
        // Find container by container_id
        const container = await this.prisma.containers.findFirst({
          where: { container_id: update.container_id }
        })

        if (container) {
          const updated = await this.updateContainer(container.id, update)
          results.push(updated)
        }
      } catch (error) {
        console.error(`Failed to update container ${update.container_id}:`, error)
      }
    }

    return results
  }

  // Get real-time container status for dashboard
  static async getContainerStatusSummary(userId: string) {
    const containers = await this.prisma.containers.findMany({
      where: { 
        user_id: userId,
        is_active: true 
      },
      include: {
        alerts: {
          where: { acknowledged_at: null },
          orderBy: { created_at: 'desc' },
          take: 5
        }
      },
      orderBy: { updated_at: 'desc' }
    })

    const summary = {
      total: containers.length,
      inTransit: containers.filter(c => c.status === 'In transit').length,
      delayed: containers.filter(c => c.delay_hours > 0).length,
      highRisk: containers.filter(c => c.risk_level === 'High').length,
      activeAlerts: containers.reduce((sum, c) => sum + c.alerts.length, 0),
      recentUpdates: containers.slice(0, 10).map(c => ({
        id: c.id,
        container_id: c.container_id,
        status: c.status,
        current_location: c.current_location,
        delay_hours: c.delay_hours,
        risk_level: c.risk_level,
        last_updated: c.last_updated,
        alerts: c.alerts.length
      }))
    }

    return summary
  }

  // Auto-generate alerts based on container updates
  static async checkAndCreateAlerts(container: Container): Promise<void> {
    const alerts = []

    // Delay alert
    if (container.delay_hours > 12) {
      const severity = container.delay_hours > 48 ? 'High' : 'Medium'
      alerts.push({
        user_id: container.user_id,
        container_id: container.id,
        title: `Container Delayed: ${container.container_id}`,
        message: `Container is delayed by ${container.delay_hours} hours at ${container.current_location}`,
        severity,
        alert_type: 'delay',
        ai_generated: false
      })
    }

    // Risk level alert
    if (container.risk_level === 'High') {
      alerts.push({
        user_id: container.user_id,
        container_id: container.id,
        title: `High Risk Alert: ${container.container_id}`,
        message: `Container has been marked as high risk. Current location: ${container.current_location}`,
        severity: 'High',
        alert_type: 'risk',
        ai_generated: false
      })
    }

    // Create alerts in database
    if (alerts.length > 0) {
      await this.prisma.alerts.createMany({
        data: alerts
      })
    }
  }

  // Clean up old container history (keep last 30 days)
  static async cleanupOldHistory(): Promise<void> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await this.prisma.container_history.deleteMany({
      where: {
        recorded_at: {
          lt: thirtyDaysAgo
        }
      }
    })
  }
}