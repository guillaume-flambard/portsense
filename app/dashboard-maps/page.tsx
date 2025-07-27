'use client'

import { useState } from 'react'
import { ContainerMap } from '@/components/container-map'
import { ContainerTimeline } from '@/components/container-timeline'
import { TanStackRealTimeDashboard } from '@/components/tanstack-real-time-dashboard'
import { ContainersTable } from '@/components/containers-table'
import { useContainers } from '@/hooks/use-containers-query'
import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Map, 
  BarChart3, 
  Table, 
  Clock, 
  MapPin,
  TrendingUp,
  Ship,
  Globe,
  Layers
} from 'lucide-react'

export default function DashboardMapsPage() {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
  const { data: containers = [], isLoading } = useContainers()
  const { isConnected } = useRealtimeSync()

  // Find the selected container for timeline
  const selectedContainerData = containers.find(c => c.id === selectedContainer)

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard with Maps & Visualizations</h1>
          <Badge variant="outline" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            Powered by Leaflet.js & TanStack
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Interactive maps, real-time tracking, and comprehensive container journey visualization
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live tracking active' : 'Offline mode'}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {containers.length} containers tracked
          </Badge>
        </div>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🗺️ Map & Visualization Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                <Map className="h-4 w-4" />
                Interactive Map
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time container positions</li>
                <li>• Status-based color coding</li>
                <li>• Interactive popups with details</li>
                <li>• Smart filtering & search</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Container Timeline
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete journey tracking</li>
                <li>• Event history & milestones</li>
                <li>• ETA predictions</li>
                <li>• Delay notifications</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Live Dashboard
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time metrics</li>
                <li>• Summary statistics</li>
                <li>• Alert monitoring</li>
                <li>• Performance indicators</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                <Table className="h-4 w-4" />
                Advanced Table
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sortable columns</li>
                <li>• Advanced filtering</li>
                <li>• Global search</li>
                <li>• Export capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Live Dashboard
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Journey Timeline
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Advanced Table
          </TabsTrigger>
        </TabsList>

        {/* Interactive Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Real-time Container Map
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all containers on an interactive map with live updates and detailed popups
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ContainerMap 
                height="700px"
                showControls={true}
                focusContainer={selectedContainer}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <TanStackRealTimeDashboard />
        </TabsContent>

        {/* Journey Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          {selectedContainerData ? (
            <ContainerTimeline 
              container={selectedContainerData} 
              showEstimates={true}
              compact={false}
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Ship className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Select a Container</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a container from the table below to view its complete journey timeline
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The timeline shows departure, transit points, current location, delays, and estimated arrival
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Container Selection Table */}
          <Card>
            <CardHeader>
              <CardTitle>Select Container for Timeline</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on any container to view its journey timeline above
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading containers...
                  </div>
                ) : containers.length > 0 ? (
                  <div className="grid gap-2">
                    {containers.slice(0, 6).map((container) => (
                      <Button
                        key={container.id}
                        variant={selectedContainer === container.id ? "default" : "outline"}
                        className="justify-start h-auto p-3"
                        onClick={() => setSelectedContainer(container.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex items-center gap-2">
                            <Ship className="h-4 w-4" />
                            <span className="font-medium">{container.container_id}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {container.status}
                          </Badge>
                          <div className="ml-auto text-xs text-muted-foreground">
                            {container.current_location || 'Unknown location'}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No containers available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Table Tab */}
        <TabsContent value="table" className="space-y-4">
          <ContainersTable />
        </TabsContent>
      </Tabs>

      {/* Technical Notes */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Map Technology</h4>
              <code className="text-xs bg-muted p-2 rounded block whitespace-pre">
{`// Leaflet.js with React Leaflet
- Interactive markers with popups
- Real-time position updates
- Custom icons and styling
- Responsive zoom controls`}
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Timeline Features</h4>
              <code className="text-xs bg-muted p-2 rounded block whitespace-pre">
{`// Journey tracking system
- Event-based timeline
- Status indicators
- ETA calculations
- Delay notifications`}
              </code>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Features:</strong> This dashboard combines interactive maps, real-time data, 
              and comprehensive journey tracking. All components are connected via TanStack Query for 
              optimal performance and real-time updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}