'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Simplified container map without hooks to test
export function SimpleContainerMap() {
  const [isLoading] = useState(false)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading containers...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Container Map (No Hooks)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
          <p>📍 Map placeholder - no TanStack Query hooks used here</p>
        </div>
      </CardContent>
    </Card>
  )
}