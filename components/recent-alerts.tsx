import { Database } from '@/lib/supabase/database.types'
import { formatDistanceToNow } from 'date-fns'

type Alert = Database['public']['Tables']['alerts']['Row']

interface RecentAlertsProps {
  alerts: Alert[]
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No alerts yet. You'll be notified of any issues with your containers.
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(alert.created_at))} ago
                      {alert.ai_generated && ' • AI Generated'}
                    </p>
                    {!alert.acknowledged_at && (
                      <button className="text-xs text-blue-600 hover:text-blue-500">
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
