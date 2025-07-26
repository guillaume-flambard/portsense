import { requireAuth } from '@/lib/auth/auth-helpers'
import { UserSettings } from '@/components/user-settings'
import { AIProviderTest } from '@/components/ai-provider-test'
import { createServerClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  // Get or create user preferences
  let { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!preferences) {
    // Create default preferences
    const { data: newPreferences } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        email_alerts: true,
        sms_alerts: false,
        delay_threshold_hours: 12,
        high_risk_threshold: 48,
        timezone: 'UTC',
        date_format: 'MM/dd/yyyy',
        ai_provider: 'claude', // Default AI provider
      })
      .select()
      .single()

    preferences = newPreferences
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your notification preferences and account settings</p>
      </div>

      <div className="space-y-8">
        <UserSettings user={user} preferences={preferences} />
        
        {/* AI Provider Testing Section */}
        <AIProviderTest />
      </div>
    </div>
  )
}
