import { requireAuth } from '@/lib/auth/auth-helpers'
import { AlertService } from '@/lib/services/alert-service'
import { AlertsList } from '@/components/alerts-list'

export default async function AlertsPage() {
  const user = await requireAuth()
  const alertService = new AlertService()
  const alerts = await alertService.getAlerts(user.id, 50)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-600">Stay informed about your container status changes</p>
      </div>

      <AlertsList alerts={alerts} />
    </div>
  )
}