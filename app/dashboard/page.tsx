import { requireAuth } from '@/lib/auth/auth-helpers'
import { ContainerService } from '@/lib/services/container-service'
import { AlertService } from '@/lib/services/alert-service'
import { DashboardStats } from '@/components/dashboard-stats'
import { RecentContainers } from '@/components/recent-containers'
import { RecentAlerts } from '@/components/recent-alerts'
import { AddContainerButton } from '@/components/add-container-button'

export default async function DashboardPage() {
  const user = await requireAuth()
  const containerService = new ContainerService()
  const alertService = new AlertService()

  const [containers, alerts] = await Promise.all([
    containerService.getContainers(user.id),
    alertService.getAlerts(user.id, 5)
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your container shipments with AI insights</p>
        </div>
        <AddContainerButton />
      </div>

      <DashboardStats containers={containers} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <RecentContainers containers={containers.slice(0, 5)} />
        <RecentAlerts alerts={alerts} />
      </div>
    </div>
  )
}
