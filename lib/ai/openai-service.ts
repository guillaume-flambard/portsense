import { openai } from './openai-client'
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

export class OpenAIService {
  static async generateStatusSummary(containerData: ContainerData): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return `Container ${containerData.container_id} is ${containerData.status.toLowerCase()} at ${containerData.current_location || 'unknown location'}.`
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: AI_PROMPTS.statusSummary(containerData)
          }
        ]
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI API error:', error)
      return `Container ${containerData.container_id} is ${containerData.status.toLowerCase()} at ${containerData.current_location || 'unknown location'}.`
    }
  }

  static async generateDelayInsight(containerData: ContainerData): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return 'Delay analysis unavailable.'
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: AI_PROMPTS.delayInsight(containerData)
          }
        ]
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI API error:', error)
      return 'Delay analysis unavailable.'
    }
  }

  static async generateWeeklyReport(containers: ContainerData[]): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return 'Weekly report generation failed - OpenAI API key not configured.'
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: AI_PROMPTS.weeklyReport(containers)
          }
        ]
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI API error:', error)
      return 'Weekly report generation failed.'
    }
  }

  static async generateAlertMessage(containerData: ContainerData, alertType: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return `Alert: Container ${containerData.container_id} - ${alertType}`
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: AI_PROMPTS.alertMessage(containerData, alertType)
          }
        ]
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI API error:', error)
      return `Alert: Container ${containerData.container_id} - ${alertType}`
    }
  }
}