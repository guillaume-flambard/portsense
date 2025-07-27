import { containers } from '@/lib/generated/prisma'

export interface AlertRule {
  id: string
  name: string
  description: string
  condition: (container: containers) => boolean
  severity: 'Low' | 'Medium' | 'High'
  alertType: 'delay' | 'issue' | 'location' | 'custom'
  cooldownHours: number // Minimum hours between alerts for same container
  enabled: boolean
}

export interface AlertTrigger {
  containerId: string
  ruleId: string
  severity: string
  alertType: string
  title: string
  message: string
  metadata?: Record<string, any>
}

export class AlertRulesEngine {
  private static instance: AlertRulesEngine
  private rules: AlertRule[] = []

  static getInstance(): AlertRulesEngine {
    if (!AlertRulesEngine.instance) {
      AlertRulesEngine.instance = new AlertRulesEngine()
      AlertRulesEngine.instance.initializeDefaultRules()
    }
    return AlertRulesEngine.instance
  }

  private initializeDefaultRules(): void {
    this.rules = [
      // Delay-based rules
      {
        id: 'critical-delay-72h',
        name: 'Critical Delay (72+ hours)',
        description: 'Container is delayed by more than 72 hours',
        condition: (container) => container.delay_hours >= 72,
        severity: 'High',
        alertType: 'delay',
        cooldownHours: 24,
        enabled: true
      },
      {
        id: 'major-delay-48h',
        name: 'Major Delay (48+ hours)',
        description: 'Container is delayed by more than 48 hours',
        condition: (container) => container.delay_hours >= 48 && container.delay_hours < 72,
        severity: 'High',
        alertType: 'delay',
        cooldownHours: 12,
        enabled: true
      },
      {
        id: 'moderate-delay-24h',
        name: 'Moderate Delay (24+ hours)',
        description: 'Container is delayed by more than 24 hours',
        condition: (container) => container.delay_hours >= 24 && container.delay_hours < 48,
        severity: 'Medium',
        alertType: 'delay',
        cooldownHours: 8,
        enabled: true
      },
      {
        id: 'minor-delay-12h',
        name: 'Minor Delay (12+ hours)',
        description: 'Container is delayed by more than 12 hours',
        condition: (container) => container.delay_hours >= 12 && container.delay_hours < 24,
        severity: 'Low',
        alertType: 'delay',
        cooldownHours: 6,
        enabled: true
      },

      // Issue-based rules
      {
        id: 'container-issues',
        name: 'Container Issues Detected',
        description: 'Container has reported issues or problems',
        condition: (container) => Array.isArray(container.issues) && container.issues.length > 0,
        severity: 'Medium',
        alertType: 'issue',
        cooldownHours: 4,
        enabled: true
      },
      {
        id: 'high-risk-container',
        name: 'High Risk Container',
        description: 'Container has been marked as high risk',
        condition: (container) => container.risk_level === 'High',
        severity: 'High',
        alertType: 'issue',
        cooldownHours: 6,
        enabled: true
      },

      // Location-based rules
      {
        id: 'stuck-at-location',
        name: 'Container Stuck at Location',
        description: 'Container has not moved for an extended period',
        condition: (container) => {
          if (!container.last_updated) return false
          const daysSinceUpdate = (Date.now() - new Date(container.last_updated).getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceUpdate > 3 && container.status !== 'delivered'
        },
        severity: 'Medium',
        alertType: 'location',
        cooldownHours: 12,
        enabled: true
      },

      // Status-based rules
      {
        id: 'unexpected-status-change',
        name: 'Unexpected Status Change',
        description: 'Container status changed unexpectedly',
        condition: (container) => {
          // This would need historical data to implement properly
          // For now, we'll check for concerning status patterns
          const concerningStatuses = ['lost', 'damaged', 'seized', 'missing']
          return concerningStatuses.some(status => 
            container.status.toLowerCase().includes(status)
          )
        },
        severity: 'High',
        alertType: 'issue',
        cooldownHours: 1,
        enabled: true
      }
    ]
  }

  evaluateContainer(container: containers): AlertTrigger[] {
    const triggers: AlertTrigger[] = []

    for (const rule of this.rules) {
      if (!rule.enabled) continue

      try {
        if (rule.condition(container)) {
          triggers.push({
            containerId: container.id,
            ruleId: rule.id,
            severity: rule.severity,
            alertType: rule.alertType,
            title: this.generateAlertTitle(rule, container),
            message: this.generateAlertMessage(rule, container),
            metadata: {
              ruleName: rule.name,
              ruleDescription: rule.description,
              cooldownHours: rule.cooldownHours,
              evaluatedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id} for container ${container.id}:`, error)
      }
    }

    return triggers
  }

  private generateAlertTitle(rule: AlertRule, container: containers): string {
    const containerRef = container.container_id || container.id

    switch (rule.alertType) {
      case 'delay':
        return `Container ${containerRef} Delayed (${container.delay_hours}h)`
      case 'issue':
        return `Container ${containerRef} Issue Detected`
      case 'location':
        return `Container ${containerRef} Location Concern`
      default:
        return `Container ${containerRef} Alert: ${rule.name}`
    }
  }

  private generateAlertMessage(rule: AlertRule, container: containers): string {
    const containerRef = container.container_id || container.id
    const location = container.current_location || 'Unknown location'

    switch (rule.id) {
      case 'critical-delay-72h':
      case 'major-delay-48h':
      case 'moderate-delay-24h':
      case 'minor-delay-12h':
        return `Container ${containerRef} is currently delayed by ${container.delay_hours} hours. Current location: ${location}. Status: ${container.status}.`
      
      case 'container-issues':
        const issues = Array.isArray(container.issues) ? container.issues.join(', ') : 'Unknown issues'
        return `Container ${containerRef} has reported issues: ${issues}. Current location: ${location}.`
      
      case 'high-risk-container':
        return `Container ${containerRef} has been classified as high risk. Immediate attention may be required. Current location: ${location}.`
      
      case 'stuck-at-location':
        const lastUpdate = container.last_updated ? new Date(container.last_updated).toLocaleDateString() : 'Unknown'
        return `Container ${containerRef} appears to be stuck at ${location}. Last update: ${lastUpdate}.`
      
      case 'unexpected-status-change':
        return `Container ${containerRef} status has changed to "${container.status}" which may require attention. Current location: ${location}.`
      
      default:
        return `Container ${containerRef} triggered alert rule: ${rule.name}. Current location: ${location}.`
    }
  }

  getRules(): AlertRule[] {
    return [...this.rules]
  }

  addRule(rule: AlertRule): void {
    this.rules.push(rule)
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId)
    if (index === -1) return false

    this.rules[index] = { ...this.rules[index], ...updates }
    return true
  }

  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId)
    if (index === -1) return false

    this.rules.splice(index, 1)
    return true
  }

  enableRule(ruleId: string): boolean {
    return this.updateRule(ruleId, { enabled: true })
  }

  disableRule(ruleId: string): boolean {
    return this.updateRule(ruleId, { enabled: false })
  }
}