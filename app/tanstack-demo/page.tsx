'use client'

import { TanStackRealTimeDashboard } from '@/components/tanstack-real-time-dashboard'
import { ContainersTable } from '@/components/containers-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function TanStackDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">TanStack Integration Demo</h1>
          <Badge variant="outline" className="text-xs">
            Powered by TanStack Query + Table
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Real-time container tracking with advanced data management and optimistic updates
        </p>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 TanStack Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ TanStack Query</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Intelligent caching system</li>
                <li>• Optimistic updates</li>
                <li>• Background refetching</li>
                <li>• Error handling & retry logic</li>
                <li>• Real-time sync with SSE</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">✅ TanStack Table</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Advanced sorting & filtering</li>
                <li>• Global search functionality</li>
                <li>• Pagination controls</li>
                <li>• Type-safe columns</li>
                <li>• Real-time data updates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">✅ Real-time Sync</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Server-Sent Events integration</li>
                <li>• Automatic cache invalidation</li>
                <li>• Smart notifications</li>
                <li>• Connection state management</li>
                <li>• Auto-reconnection logic</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Real-time Dashboard</TabsTrigger>
          <TabsTrigger value="table">Advanced Table</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <TanStackRealTimeDashboard />
        </TabsContent>
        
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
              <h4 className="font-semibold mb-2">Query Configuration</h4>
              <code className="text-xs bg-muted p-2 rounded block whitespace-pre">
{`// Smart caching & refetching
staleTime: 30s
gcTime: 5min
refetchOnWindowFocus: true
optimisticUpdates: enabled`}
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Real-time Features</h4>
              <code className="text-xs bg-muted p-2 rounded block whitespace-pre">
{`// SSE + TanStack integration
automatic cache updates
smart invalidation
toast notifications
connection management`}
              </code>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro Tip:</strong> Open the TanStack Query DevTools (bottom-right) to see the cache state, 
              query invalidations, and background refetches in real-time. Try updating a container to see optimistic updates in action!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}