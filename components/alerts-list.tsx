'use client'

import { useState } from 'react'
import { Database } from '@/lib/supabase/database.types'
import { formatDistanceToNow, format } from 'date-fns'

type Alert = Database['public']['Tables']['alerts']['Row']

interface AlertsListProps {
  alerts: Alert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'delay' | 'issue'>('all')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High':
        return '🚨'
      case 'Medium':
        return '⚠️'
      case 'Low':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.acknowledged_at
    if (filter === 'delay') return alert.alert_type === 'delay'
    if (filter === 'issue') return alert.alert_type === 'issue'
    return true
  })

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      })
      // Refresh the page or update the state
      window.location.reload()
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Alerts', count: alerts.length },
              { key: 'unread', label: 'Unread', count: alerts.filter(a => !a.acknowledged_at).length },
              { key: 'delay', label: 'Delays', count: alerts.filter(a => a.alert_type === 'delay').length },
              { key: 'issue', label: 'Issues', count: alerts.filter(a => a.alert_type === 'issue').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    filter === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-6h2zm-2-13h5l-5-5-5 5h5v6h2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any alerts yet."
                : `No ${filter} alerts to show.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 ${
                  !alert.acknowledged_at ? 'bg-blue-50' : 'bg-white'
                } hover:bg-gray-50`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {getSeverityIcon(alert.severity)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {alert.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {alert.ai_generated && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          AI Generated
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {format(new Date(alert.created_at), 'PPp')}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {alert.alert_type} alert
                        </span>
                      </div>
                      
                      {!alert.acknowledged_at && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}