'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { formatDistanceToNow } from 'date-fns'
import { MapContainer as MapContainerType } from './container-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, MapPin, Clock, AlertTriangle } from 'lucide-react'

// Fix default markers in Leaflet
import 'leaflet/dist/leaflet.css'

// Custom marker icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      ">
        ${icon}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  })
}

interface MapViewControllerProps {
  center: [number, number]
  zoom: number
  onMapViewChange: (view: { center: [number, number]; zoom: number }) => void
}

function MapViewController({ center, zoom, onMapViewChange }: MapViewControllerProps) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])

  useEffect(() => {
    const handleMoveEnd = () => {
      const mapCenter = map.getCenter()
      const mapZoom = map.getZoom()
      onMapViewChange({
        center: [mapCenter.lat, mapCenter.lng],
        zoom: mapZoom
      })
    }

    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleMoveEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleMoveEnd)
    }
  }, [map, onMapViewChange])

  return null
}

interface LeafletMapProps {
  containers: MapContainerType[]
  center: [number, number]
  zoom: number
  getContainerColor: (container: MapContainerType) => string
  getStatusIcon: (container: MapContainerType) => string
  onMapViewChange: (view: { center: [number, number]; zoom: number }) => void
}

export default function LeafletMap({
  containers,
  center,
  zoom,
  getContainerColor,
  getStatusIcon,
  onMapViewChange
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)

  const getStatusBadgeColor = (status: string) => {
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

  const getRiskBadgeColor = (risk: string | null) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapViewController 
        center={center} 
        zoom={zoom} 
        onMapViewChange={onMapViewChange} 
      />

      {containers.map((container) => {
        if (!container.latitude || !container.longitude) return null

        const color = getContainerColor(container)
        const icon = getStatusIcon(container)
        const customIcon = createCustomIcon(color, icon)

        return (
          <Marker
            key={container.id}
            position={[container.latitude, container.longitude]}
            icon={customIcon}
          >
            <Popup maxWidth={400} className="container-popup">
              <div className="p-4 min-w-[300px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h3 className="font-semibold text-lg">{container.container_id}</h3>
                  </div>
                  <Badge className={getStatusBadgeColor(container.status)}>
                    {container.status}
                  </Badge>
                </div>

                {/* Container Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Carrier</p>
                      <p className="font-medium">{container.carrier || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vessel</p>
                      <p className="font-medium">{container.vessel_name || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-sm">Current Location</p>
                      <p className="font-medium">{container.current_location || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* ETA */}
                  {container.eta && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-sm">Estimated Arrival</p>
                        <p className="font-medium">
                          {new Date(container.eta).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delay Information */}
                  {container.delay_hours > 0 && (
                    <div className="flex items-start gap-2 p-2 bg-red-50 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-700 font-medium text-sm">
                          Delayed by {container.delay_hours} hours
                        </p>
                        {container.issues && (
                          <p className="text-red-600 text-xs mt-1">
                            {Array.isArray(container.issues) ? container.issues.join(', ') : container.issues}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Risk Level */}
                  {container.risk_level && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                      <Badge variant="outline" className={getRiskBadgeColor(container.risk_level)}>
                        {container.risk_level}
                      </Badge>
                    </div>
                  )}

                  {/* Last Updated */}
                  {container.last_updated && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Updated {formatDistanceToNow(new Date(container.last_updated))} ago
                    </div>
                  )}

                  {/* AI Summary */}
                  {container.ai_summary && (
                    <div className="border-t pt-3">
                      <p className="text-muted-foreground text-sm mb-1">AI Insight</p>
                      <p className="text-sm italic text-gray-700 bg-blue-50 p-2 rounded">
                        {container.ai_summary}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        // Navigate to container details
                        window.open(`/dashboard/containers/${container.id}`, '_blank')
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}