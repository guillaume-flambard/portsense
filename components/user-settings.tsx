'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/database.types'
import { useRouter } from 'next/navigation'

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

interface UserSettingsProps {
  user: User
  preferences: UserPreferences | null
}

export function UserSettings({ user, preferences }: UserSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  
  const [settings, setSettings] = useState({
    email_alerts: preferences?.email_alerts ?? true,
    sms_alerts: preferences?.sms_alerts ?? false,
    slack_webhook_url: preferences?.slack_webhook_url ?? '',
    delay_threshold_hours: preferences?.delay_threshold_hours ?? 12,
    high_risk_threshold: preferences?.high_risk_threshold ?? 48,
    timezone: preferences?.timezone ?? 'UTC',
    date_format: preferences?.date_format ?? 'MM/dd/yyyy',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage('Settings saved successfully!')
        router.refresh()
      } else {
        setMessage('Failed to save settings')
      }
    } catch (error) {
      setMessage('An error occurred while saving')
    } finally {
      setLoading(false)
    }
  }

  const generateShareableLink = async (containerId: string) => {
    // In a real implementation, this would create a secure sharing token
    const token = Buffer.from(containerId).toString('base64')
    const shareUrl = `${window.location.origin}/share/${token}`
    
    await navigator.clipboard.writeText(shareUrl)
    setMessage('Shareable link copied to clipboard!')
  }

  return (
    <div className="space-y-8">
      {/* Account Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {user.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <form onSubmit={handleSave}>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Alert Types */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Methods</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="email-alerts"
                    type="checkbox"
                    checked={settings.email_alerts}
                    onChange={(e) => setSettings({ ...settings, email_alerts: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-alerts" className="ml-3 text-sm text-gray-700">
                    Email notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="sms-alerts"
                    type="checkbox"
                    checked={settings.sms_alerts}
                    onChange={(e) => setSettings({ ...settings, sms_alerts: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sms-alerts" className="ml-3 text-sm text-gray-700">
                    SMS notifications (requires phone number in environment)
                  </label>
                </div>
              </div>
            </div>

            {/* Slack Integration */}
            <div>
              <label htmlFor="slack-webhook" className="block text-sm font-medium text-gray-700 mb-2">
                Slack Webhook URL (optional)
              </label>
              <input
                id="slack-webhook"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={settings.slack_webhook_url}
                onChange={(e) => setSettings({ ...settings, slack_webhook_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Slack webhook URL to receive alerts in your workspace
              </p>
            </div>

            {/* Alert Thresholds */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Thresholds</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="delay-threshold" className="block text-sm font-medium text-gray-700 mb-2">
                    Delay Alert Threshold (hours)
                  </label>
                  <input
                    id="delay-threshold"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.delay_threshold_hours}
                    onChange={(e) => setSettings({ ...settings, delay_threshold_hours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="high-risk-threshold" className="block text-sm font-medium text-gray-700 mb-2">
                    High Risk Threshold (hours)
                  </label>
                  <input
                    id="high-risk-threshold"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.high_risk_threshold}
                    onChange={(e) => setSettings({ ...settings, high_risk_threshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Display Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Display Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Berlin">Berlin</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Singapore">Singapore</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="date-format" className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    id="date-format"
                    value={settings.date_format}
                    onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            {message && (
              <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* Container Sharing */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Container Sharing</h2>
          <p className="text-gray-600 mt-1">Generate public links to share container status with clients</p>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              📤 Share Container Status
            </h3>
            <p className="text-blue-800 text-sm mb-4">
              Create secure, read-only links that allow your clients to track container progress without needing an account.
            </p>
            <p className="text-xs text-blue-700">
              💡 Tip: Go to any container details page to generate a shareable link for that specific container.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}