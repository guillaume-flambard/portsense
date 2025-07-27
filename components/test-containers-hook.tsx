'use client'

import { useContainers } from '@/hooks/use-containers-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Test component to isolate the useContainers hook issue
export function TestContainersHook() {
  try {
    const { data, isLoading, error } = useContainers()

    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-4">
            <p>Loading containers...</p>
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-4">
            <p className="text-red-600">Error: {error.message}</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>✅ useContainers Hook Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Containers loaded: {Array.isArray(data) ? data.length : 'Not an array'}</p>
          <p>Data type: {typeof data}</p>
          <pre className="text-xs bg-muted p-2 rounded mt-2">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    )
  } catch (err) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-red-600">Hook Error: {String(err)}</p>
        </CardContent>
      </Card>
    )
  }
}