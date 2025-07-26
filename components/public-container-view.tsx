'use client'

import { useState } from 'react'
import { Database } from '@/lib/supabase/database.types'
import { formatDistanceToNow, format } from 'date-fns'

type Container = Database['public']['Tables']['containers']['Row']
type ContainerHistory = Database['public']['Tables']['container_history']['Row']

interface PublicContainerViewProps {
  container: Container
  history: ContainerHistory[]
}

export function PublicContainerView({ container, history }: PublicContainerViewProps) {
  const [showFullHistory, setShowFullHistory] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in transit':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'at port':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressPercentage = () => {
    if (container.status.toLowerCase() === 'delivered') return 100
    if (container.status.toLowerCase() === 'in transit') return 60
    if (container.status.toLowerCase() === 'at port') return 40
    return 20
  }

  return (
    <div className="space-y-8">
      {/* Container Overview */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold font-mono">
                {container.container_id}
              </h2>
              <p className="text-blue-100 mt-2">
                {container.carrier && `${container.carrier} • `}
                {container.vessel_name || 'Maritime Shipment'}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(container.status)}`}>
                {container.status}
              </div>
              {container.delay_hours > 0 && (
                <p className="text-red-200 text-sm mt-2">
                  ⏰ {container.delay_hours}h delay
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{container.origin_port || 'Origin'}</span>
              <span>{container.destination_port || 'Destination'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Departed</span>
              <span>{getProgressPercentage()}% complete</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📍 Current Location</h3>
              <p className="text-lg font-semibold text-gray-900">
                {container.current_location || 'Unknown'}
              </p>
            </div>

            {container.eta && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">🕐 Estimated Arrival</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(container.eta), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(container.eta), 'h:mm a')}
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📊 Risk Level</h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                container.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                container.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {container.risk_level}
              </span>
            </div>

            {container.vessel_name && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">🚢 Vessel</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {container.vessel_name}
                </p>
                {container.voyage_number && (
                  <p className="text-sm text-gray-600">
                    Voyage {container.voyage_number}
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">🔄 Last Updated</h3>
              <p className="text-lg font-semibold text-gray-900">
                {container.last_updated ? formatDistanceToNow(new Date(container.last_updated)) + ' ago' : 'Unknown'}
              </p>
            </div>

            {container.issues && container.issues.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-700 mb-2">⚠️ Issues</h3>
                <div className="space-y-1">
                  {container.issues.map((issue, index) => (
                    <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Summary */}
          {container.ai_summary && (
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                🤖 AI Summary
              </h3>
              <p className="text-gray-800 italic leading-relaxed">
                {container.ai_summary}
              </p>
              <p className="text-xs text-blue-600 mt-3">
                Generated by Claude AI
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tracking History */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              📋 Tracking History
            </h3>
            {history.length > 3 && (
              <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                {showFullHistory ? 'Show Less' : `Show All (${history.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tracking history available yet.</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {(showFullHistory ? history : history.slice(0, 3)).map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== (showFullHistory ? history : history.slice(0, 3)).length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-sm">📍</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-base font-medium text-gray-900">
                              {event.status}
                            </p>
                            {event.location && (
                              <p className="text-sm text-gray-600">
                                at {event.location}
                              </p>
                            )}
                            {event.delay_hours && event.delay_hours > 0 && (
                              <p className="text-sm text-red-600 font-medium">
                                {event.delay_hours}h delay
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={event.recorded_at}>
                              {format(new Date(event.recorded_at), 'MMM d')}
                            </time>
                            <br />
                            <time dateTime={event.recorded_at}>
                              {format(new Date(event.recorded_at), 'h:mm a')}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Need More Information?
        </h3>
        <p className="text-gray-600 mb-4">
          This tracking page provides real-time updates about your shipment.
          For additional questions, contact your logistics provider.
        </p>
        <button 
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          🖨️ Print This Page
        </button>
      </div>
    </div>
  )
}