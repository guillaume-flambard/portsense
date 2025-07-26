import { anthropic } from './claude-client'
import { AI_PROMPTS } from './prompts'

export interface ContainerData {
  container_id: string
  status: string
  current_location?: string
  origin_port?: string
  destination_port?: string
  eta?: string
  delay_hours: number
  carrier?: string
  issues?: string[]
  vessel_name?: string
}

export class ClaudeService {
  static async generateStatusSummary(containerData: ContainerData): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: AI_PROMPTS.statusSummary(containerData)
          }
        ]
      })

      return response.content[0].type === 'text' ? response.content[0].text : ''
    } catch (error) {
      console.error('Claude API error:', error)
      return `Container ${containerData.container_id} is ${containerData.status.toLowerCase()} at ${containerData.current_location || 'unknown location'}.`
    }
  }

  static async generateDelayInsight(containerData: ContainerData): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: AI_PROMPTS.delayInsight(containerData)
          }
        ]
      })

      return response.content[0].type === 'text' ? response.content[0].text : ''
    } catch (error) {
      console.error('Claude API error:', error)
      return 'Delay analysis unavailable.'
    }
  }

  static async generateWeeklyReport(containers: ContainerData[]): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: AI_PROMPTS.weeklyReport(containers)
          }
        ]
      })

      return response.content[0].type === 'text' ? response.content[0].text : ''
    } catch (error) {
      console.error('Claude API error:', error)
      return 'Weekly report generation failed.'
    }
  }

  static async generateAlertMessage(containerData: ContainerData, alertType: string): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: AI_PROMPTS.alertMessage(containerData, alertType)
          }
        ]
      })

      return response.content[0].type === 'text' ? response.content[0].text : ''
    } catch (error) {
      console.error('Claude API error:', error)
      return `Alert: Container ${containerData.container_id} - ${alertType}`
    }
  }
}
