'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  MapPin, 
  Ship, 
  Package, 
  CheckCircle, 
  AlertTriangle,
  Truck,
  Plane,
  MoreHorizontal,
  Calendar,
  Navigation
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { containers as Container } from '@/lib/generated/prisma'

interface TimelineEvent {
  id: string
  timestamp: string
  location: string
  status: string
  description: string
  type: 'departure' | 'arrival' | 'transit' | 'delay' | 'delivered' | 'customs'
  isCompleted: boolean
  estimatedTime?: string
}

interface ContainerTimelineProps {
  container: Container
  showEstimates?: boolean
  compact?: boolean
}

export function ContainerTimeline({ 
  container, 
  showEstimates = true, 
  compact = false 
}: ContainerTimelineProps) {
  const [showAllEvents, setShowAllEvents] = useState(false)

  // Mock timeline events based on container data
  // In production, this would come from actual tracking API
  const generateTimelineEvents = (container: Container): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        id: '1',
        timestamp: '2024-01-15T08:00:00Z',
        location: container.origin_port || 'Port of Shanghai',
        status: 'Departed',
        description: 'Container departed from origin port',
        type: 'departure',
        isCompleted: true
      },
      {
        id: '2',
        timestamp: '2024-01-16T14:30:00Z',
        location: 'Singapore Port',
        status: 'In Transit',
        description: 'Container in transit at major hub',
        type: 'transit',
        isCompleted: true
      },
      {
        id: '3',
        timestamp: '2024-01-18T09:15:00Z',
        location: 'Suez Canal',
        status: 'In Transit',
        description: 'Container passing through Suez Canal',
        type: 'transit',
        isCompleted: true
      },
      {
        id: '4',
        timestamp: '2024-01-20T16:45:00Z',
        location: container.current_location || 'Mediterranean Sea',
        status: container.status,
        description: 'Current container location',
        type: 'transit',
        isCompleted: false
      }
    ]

    // Add delay event if container is delayed
    if (container.delay_hours > 0) {
      events.push({
        id: '5',
        timestamp: new Date(Date.now() - container.delay_hours * 60 * 60 * 1000).toISOString(),
        location: container.current_location || 'Unknown',
        status: 'Delayed',
        description: `Container delayed by ${container.delay_hours} hours`,
        type: 'delay',
        isCompleted: true
      })
    }

    // Add estimated arrival if ETA exists
    if (container.eta) {
      events.push({
        id: '6',
        timestamp: container.eta?.toISOString() || new Date().toISOString(),
        location: container.destination_port || 'Port of Rotterdam',
        status: 'Expected Arrival',
        description: 'Estimated arrival at destination',
        type: 'arrival',
        isCompleted: false,
        estimatedTime: container.eta?.toISOString()
      })
    }

    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const timelineEvents = generateTimelineEvents(container)
  const displayEvents = showAllEvents ? timelineEvents : timelineEvents.slice(0, 4)

  const getEventIcon = (type: TimelineEvent['type'], isCompleted: boolean) => {
    const iconClass = isCompleted ? 'text-green-600' : 'text-blue-600'
    
    switch (type) {
      case 'departure':
        return <Ship className={`h-4 w-4 ${iconClass}`} />
      case 'arrival':
        return <CheckCircle className={`h-4 w-4 ${iconClass}`} />
      case 'transit':
        return <Navigation className={`h-4 w-4 ${iconClass}`} />
      case 'delay':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'delivered':
        return <Package className="h-4 w-4 text-green-600" />
      case 'customs':
        return <Clock className={`h-4 w-4 ${iconClass}`} />
      default:
        return <MapPin className={`h-4 w-4 ${iconClass}`} />
    }
  }

  const getEventBadgeColor = (type: TimelineEvent['type'], isCompleted: boolean) => {
    if (type === 'delay') return 'bg-red-100 text-red-800'
    if (isCompleted) return 'bg-green-100 text-green-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Container Journey
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {timelineEvents.filter(e => e.isCompleted).length} of {timelineEvents.length} completed
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Track the complete journey of container {container.container_id}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayEvents.map((event, index) => (
            <div key={event.id} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                  ${event.isCompleted 
                    ? 'bg-green-50 border-green-500' 
                    : event.type === 'delay' 
                      ? 'bg-red-50 border-red-500'
                      : 'bg-blue-50 border-blue-500'
                  }
                `}>
                  {getEventIcon(event.type, event.isCompleted)}
                </div>
                {index < displayEvents.length - 1 && (
                  <div className={`
                    w-0.5 h-8 mt-2
                    ${event.isCompleted ? 'bg-green-300' : 'bg-gray-300'}
                  `} />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{event.status}</h4>
                    <Badge 
                      variant="outline" 
                      className={getEventBadgeColor(event.type, event.isCompleted)}
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.estimatedTime ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>ETA: {format(new Date(event.estimatedTime), 'MMM dd, HH:mm')}</span>
                      </div>
                    ) : (
                      format(new Date(event.timestamp), 'MMM dd, HH:mm')
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  
                  {!compact && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {event.isCompleted 
                        ? `Completed ${formatDistanceToNow(new Date(event.timestamp))} ago`
                        : event.estimatedTime 
                          ? `Expected in ${formatDistanceToNow(new Date(event.estimatedTime))}`
                          : 'In progress'
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Show More Button */}
          {timelineEvents.length > 4 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllEvents(!showAllEvents)}
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                {showAllEvents ? 'Show Less' : `Show ${timelineEvents.length - 4} More Events`}
              </Button>
            </div>
          )}
        </div>

        {/* Journey Summary */}
        {!compact && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h5 className="font-medium mb-2">Journey Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Origin</p>
                <p className="font-medium">{container.origin_port || 'Shanghai'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Destination</p>
                <p className="font-medium">{container.destination_port || 'Rotterdam'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Transit Time</p>
                <p className="font-medium">
                  {container.eta 
                    ? `${Math.ceil((new Date(container.eta).getTime() - new Date(timelineEvents[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))} days`
                    : '~21 days'
                  }
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Distance</p>
                <p className="font-medium">~11,500 km</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}