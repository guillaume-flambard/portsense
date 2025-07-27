'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw
} from 'lucide-react'

interface AlertRule {
  id: string
  name: string
  description: string
  severity: string
  alertType: string
  enabled: boolean
  cooldownHours: number
}

interface AlertStats {
  total: number
  unread: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
}

interface AlertManagementDashboardProps {
  className?: string
}

export function AlertManagementDashboard({ className }: AlertManagementDashboardProps) {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    unread: 0,
    byType: {},
    bySeverity: {}
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load alert rules and stats in parallel
      const [rulesResponse, statsResponse] = await Promise.all([
        fetch('/api/alerts/rules'),
        fetch('/api/alerts/stats')
      ])

      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json()
        setRules(rulesData.rules || [])
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats || {
          total: 0,
          unread: 0,
          byType: {},
          bySeverity: {}
        })
      }
    } catch (error) {
      console.error('Error loading alert management data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRuleStatus = async (ruleId: string, enabled: boolean) => {
    try {
      setUpdating(ruleId)
      
      const response = await fetch('/api/alerts/rules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ruleId, enabled }),
      })

      if (response.ok) {
        setRules(prev => prev.map(rule => 
          rule.id === ruleId ? { ...rule, enabled } : rule
        ))
      } else {
        console.error('Failed to update rule status')
      }
    } catch (error) {
      console.error('Error updating rule status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'delay':
        return <Clock className="h-4 w-4" />
      case 'issue':
        return <AlertTriangle className="h-4 w-4" />
      case 'location':
        return <Activity className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading alert management...
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Management</h2>
          <p className="text-muted-foreground">
            Manage alert rules and monitor notification activity
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unread}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rules.filter(r => r.enabled).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {rules.length} total rules
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.bySeverity.High || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  High severity alerts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alert Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">By Type</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <span className="capitalize">{type}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">By Severity</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.bySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <Badge className={getSeverityColor(severity)}>
                          {severity}
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enable or disable alert rules to customize your notification preferences.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {rule.alertType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cooldown: {rule.cooldownHours}h
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => updateRuleStatus(rule.id, enabled)}
                        disabled={updating === rule.id}
                      />
                      {updating === rule.id && (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Alert Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics visualization would be implemented here</p>
                  <p className="text-sm">Chart showing alert trends over time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Response time metrics would be shown here</p>
                  <p className="text-sm">Average time to acknowledge alerts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}