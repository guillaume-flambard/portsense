'use client'

import { useState } from 'react'
import { Database } from '@/lib/supabase/database.types'
import { formatDistanceToNow, format } from 'date-fns'

type Container = Database['public']['Tables']['containers']['Row']

interface ContainerDetailsProps {
  container: Container
}

export function ContainerDetails({ container }: ContainerDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'in transit':
        return 'bg-blue-100 text-blue-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      case 'at port':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Container Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Container ID
              </label>
              <p className="text-lg font-mono font-semibold text-gray-900">
                {container.container_id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(container.status)}`}>
                {container.status}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Location
              </label>
              <p className="text-gray-900">{container.current_location || 'Unknown'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carrier
              </label>
              <p className="text-gray-900">{container.carrier || 'Not specified'}</p>
            </div>

            {container.vessel_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vessel
                </label>
                <p className="text-gray-900">
                  {container.vessel_name}
                  {container.voyage_number && ` (${container.voyage_number})`}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origin Port
              </label>
              <p className="text-gray-900">{container.origin_port || 'Not specified'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Port
              </label>
              <p className="text-gray-900">{container.destination_port || 'Not specified'}</p>
            </div>

            {container.eta && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Arrival
                </label>
                <p className="text-gray-900">
                  {format(new Date(container.eta), 'PPP p')}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(container.risk_level)}`}>
                {container.risk_level}
              </span>
            </div>

            {container.delay_hours > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delay
                </label>
                <p className="text-red-600 font-medium">
                  {container.delay_hours} hours behind schedule
                </p>
              </div>
            )}
          </div>
        </div>

        {container.issues && container.issues.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Known Issues
            </label>
            <div className="flex flex-wrap gap-2">
              {container.issues.map((issue, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        )}

        {container.ai_summary && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Summary
            </label>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-800 italic">{container.ai_summary}</p>
              <p className="text-xs text-gray-500 mt-2">
                Generated by Claude AI • Updated {formatDistanceToNow(new Date(container.last_updated))} ago
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Created:</strong> {format(new Date(container.created_at), 'PPP')}
            </div>
            <div>
              <strong>Last Updated:</strong> {formatDistanceToNow(new Date(container.last_updated))} ago
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}