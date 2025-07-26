'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

export function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [aiProvider, setAiProvider] = useState<string>('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    const getAIProvider = async () => {
      try {
        const response = await fetch('/api/ai/providers')
        const data = await response.json()
        setAiProvider(data.currentProvider)
      } catch (error) {
        console.error('Failed to fetch AI provider:', error)
      }
    }
    
    getUser()
    getAIProvider()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const getAIProviderDisplay = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖 GPT-4'
      case 'claude':
        return '🧠 Claude'
      default:
        return '🤖 AI'
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              🚢 PortSense
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/dashboard/containers" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Containers
              </Link>
              <Link href="/dashboard/map" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Map View
              </Link>
              <Link href="/dashboard/alerts" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Alerts
              </Link>
              <Link href="/dashboard/reports" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Reports
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* AI Provider Indicator */}
            {aiProvider && (
              <div className="hidden md:flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {getAIProviderDisplay(aiProvider)}
                </span>
              </div>
            )}
            
            <span className="text-sm text-gray-700">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
