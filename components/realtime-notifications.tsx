'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { containers as Container } from '@/lib/generated/prisma'
import { MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface RealtimeNotificationsProps {
  containers: Container[]
}

export function RealtimeNotifications({ containers }: RealtimeNotificationsProps) {
  const previousContainers = useRef<Container[]>([])

  useEffect(() => {
    if (previousContainers.current.length === 0) {
      previousContainers.current = containers
      return
    }

    // Compare current containers with previous to detect changes
    containers.forEach((container) => {
      const previousContainer = previousContainers.current.find(c => c.id === container.id)
      
      if (!previousContainer) {
        // New container
        toast.info('📦 New Container Added', {
          description: `${container.container_id} is now being tracked`,
          duration: 4000,
        })
        return
      }

      // Check for status changes
      if (previousContainer.status !== container.status) {
        const isGoodStatus = ['Delivered', 'At destination'].includes(container.status)
        const isBadStatus = ['Delayed', 'Lost'].includes(container.status)
        
        if (isGoodStatus) {
          toast.success('✅ Container Delivered', {
            description: `${container.container_id} has arrived: ${container.status}`,
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => {
                window.open(`/dashboard/containers/${container.id}`, '_blank')
              }
            }
          })
        } else if (isBadStatus) {
          toast.error('❌ Container Alert', {
            description: `${container.container_id} status: ${container.status}`,
            duration: 6000,
            action: {
              label: 'Check',
              onClick: () => {
                window.open(`/dashboard/containers/${container.id}`, '_blank')
              }
            }
          })
        } else {
          toast.info('🔄 Status Update', {
            description: `${container.container_id} is now ${container.status}`,
            duration: 3000,
          })
        }
      }

      // Check for location changes
      if (previousContainer.current_location !== container.current_location) {
        toast.info('📍 Location Update', {
          description: `${container.container_id} → ${container.current_location}`,
          duration: 3000,
          icon: <MapPin className="h-4 w-4" />
        })
      }

      // Check for new delays
      if ((previousContainer.delay_hours || 0) < (container.delay_hours || 0)) {
        toast.warning('⏰ Delay Alert', {
          description: `${container.container_id} delayed by ${container.delay_hours} hours`,
          duration: 5000,
          icon: <Clock className="h-4 w-4" />
        })
      }

      // Check for risk level changes
      if (previousContainer.risk_level !== container.risk_level) {
        if (container.risk_level === 'High') {
          toast.error('⚠️ High Risk Alert', {
            description: `${container.container_id} marked as high risk`,
            duration: 6000,
            icon: <AlertTriangle className="h-4 w-4" />,
            action: {
              label: 'Investigate',
              onClick: () => {
                window.open(`/dashboard/containers/${container.id}`, '_blank')
              }
            }
          })
        } else if (container.risk_level === 'Low' && previousContainer.risk_level === 'High') {
          toast.success('✅ Risk Reduced', {
            description: `${container.container_id} risk level reduced to ${container.risk_level}`,
            duration: 4000,
            icon: <CheckCircle className="h-4 w-4" />
          })
        }
      }
    })

    // Update the reference
    previousContainers.current = containers
  }, [containers])

  return null // This component doesn't render anything
}