'use client'

import { useContainers } from '@/hooks/use-containers-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, MapPin, Clock, AlertTriangle } from 'lucide-react'

// Simple containers list without TanStack Table
export function SimpleContainersList() {
  const { data: containers = [], isLoading, error } = useContainers()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'at destination':
        return 'bg-green-100 text-green-800'
      case 'in transit':
        return 'bg-blue-100 text-blue-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      case 'loading':
      case 'unloading':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading containers...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Simple Containers List (No TanStack Table)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {containers.length} containers
          </p>
          
          {containers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No containers found
            </div>
          ) : (
            <div className="space-y-2">
              {containers.slice(0, 5).map((container) => (
                <div
                  key={container.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{container.container_id}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {container.current_location || 'Unknown location'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(container.status)}>
                      {container.status}
                    </Badge>
                    
                    {container.delay_hours > 0 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {container.delay_hours}h
                      </Badge>
                    )}
                    
                    {container.risk_level === 'High' && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        High Risk
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {containers.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {containers.length - 5} more containers
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}