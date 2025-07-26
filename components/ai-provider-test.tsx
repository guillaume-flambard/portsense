'use client'

import { useState } from 'react'

interface TestResult {
  success: boolean
  provider: string
  summary?: string
  error?: string
  responseTime: number
  timestamp: string
}

export function AIProviderTest() {
  const [testing, setTesting] = useState<string | null>(null)
  const [results, setResults] = useState<TestResult[]>([])

  const testProvider = async (provider: 'claude' | 'openai') => {
    setTesting(provider)
    
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      })
      
      const result = await response.json()
      setResults(prev => [result, ...prev.slice(0, 4)]) // Keep last 5 results
    } catch (error) {
      setResults(prev => [{
        success: false,
        provider,
        error: 'Network error',
        responseTime: 0,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 4)])
    } finally {
      setTesting(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Provider Testing</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-3">
          <button
            onClick={() => testProvider('claude')}
            disabled={testing === 'claude'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {testing === 'claude' ? 'Testing Claude...' : 'Test Claude'}
          </button>
          
          <button
            onClick={() => testProvider('openai')}
            disabled={testing === 'openai'}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {testing === 'openai' ? 'Testing OpenAI...' : 'Test OpenAI'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Recent Test Results</h4>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {result.provider.toUpperCase()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.responseTime}ms
                    </span>
                  </div>
                </div>
                
                {result.success && result.summary ? (
                  <p className="text-sm text-gray-700 italic">
                    "{result.summary.slice(0, 100)}..."
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    Error: {result.error}
                  </p>
                )}
                
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}