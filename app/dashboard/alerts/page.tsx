import { Suspense } from 'react'
import { requireAuth } from '@/lib/auth/auth-helpers'
import { AlertService } from '@/lib/services/alert-service'
import { AlertsList } from '@/components/alerts-list'
import { AlertManagementDashboard } from '@/components/alert-management-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Settings, BarChart3 } from 'lucide-react'

export default async function AlertsPage() {
  const user = await requireAuth()
  const alertService = new AlertService()
  const alerts = await alertService.getAlerts(user.id, 50)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">
            Monitor and manage your container alerts and notification preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {alerts.filter(a => !a.acknowledged_at).length} unread alerts
          </div>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <AlertsList alerts={alerts} />
          </Suspense>
        </TabsContent>

        <TabsContent value="management">
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <AlertManagementDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-16 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
            <p>Detailed analytics and reporting will be available in a future update.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}