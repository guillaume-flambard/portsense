'use client'

import { DebugTest } from '@/components/debug-test'
import { SimpleContainerMap } from '@/components/simple-container-map'
import { TestContainersHook } from '@/components/test-containers-hook'
import { SimpleContainersList } from '@/components/simple-containers-list'
import { ContainersTableFixed } from '@/components/containers-table-fixed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardMapsDebugPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Test 1: Basic TanStack Query</h3>
              <DebugTest />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Test 2: Simple Map Component</h3>
              <SimpleContainerMap />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Test 3: useContainers Hook</h3>
              <TestContainersHook />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Test 4: Simple Containers List (no TanStack Table)</h3>
              <SimpleContainersList />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Test 5: Fixed TanStack Table (no flexRender)</h3>
              <ContainersTableFixed />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}