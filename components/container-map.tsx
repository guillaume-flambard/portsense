'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Database } from '@/lib/supabase/database.types'

type Container = Database['public']['Tables']['containers']['Row']

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface ContainerMapProps {
  containers: Container[]
}

export function ContainerMap({ containers }: ContainerMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading map...</div>
      </div>
    )
  }

  // Default center (Singapore)
  const defaultCenter: [number, number] = [1.3521, 103.8198]
  
  // Calculate map center based on containers
  const mapCenter = containers.length > 0 
    ? [
        containers.reduce((sum, c) => sum + (c.latitude || 0), 0) / containers.length,
        containers.reduce((sum, c) => sum + (c.longitude || 0), 0) / containers.length
      ] as [number, number]
    : defaultCenter

  const getMarkerColor = (container: Container) => {
    if (container.delay_hours > 24) return '🔴' // Red for major delays
    if (container.delay_hours > 0) return '🟡' // Yellow for minor delays
    if (container.status === 'Delivered') return '🟢' // Green for delivered
    return '🔵' // Blue for in transit
  }

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={mapCenter}
        zoom={containers.length > 1 ? 2 : 10}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {containers.map((container) => (
          container.latitude && container.longitude && (
            <Marker
              key={container.id}
              position={[container.latitude, container.longitude]}
            >
              <Popup>
                <div className="p-2 min-w-64">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getMarkerColor(container)}</span>
                    <h3 className="font-semibold">{container.container_id}</h3>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p><strong>Status:</strong> {container.status}</p>
                    <p><strong>Location:</strong> {container.current_location}</p>
                    <p><strong>Carrier:</strong> {container.carrier}</p>
                    
                    {container.delay_hours > 0 && (
                      <p className="text-red-600">
                        <strong>Delay:</strong> {container.delay_hours} hours
                      </p>
                    )}
                    
                    {container.eta && (
                      <p><strong>ETA:</strong> {new Date(container.eta).toLocaleDateString()}</p>
                    )}
                    
                    {container.ai_summary && (
                      <p className="italic text-gray-600 mt-2 border-t pt-2">
                        {container.ai_summary}
                      </p>
                    )}
                  </div>
                  
                  <button className="mt-3 w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {containers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No containers with location data found</p>
            <p className="text-sm text-gray-500">Add containers to see them on the map</p>
          </div>
        </div>
      )}
    </div>
  )
}