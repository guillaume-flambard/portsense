// import { ClaudeService } from './claude-service'
import { OpenAIService } from './openai-service'
import { ContainerData } from './openai-service'

export type AIProvider = 'openai' // | 'claude'

export class AIService {
  private static getProvider(): AIProvider {
    // Force OpenAI only for now
    return 'openai'
    
    // Commented out multi-provider logic
    /*
    const provider = process.env.AI_PROVIDER?.toLowerCase() as AIProvider
    
    // Check availability and fallback logic
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      return 'openai'
    } else if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
      return 'claude'
    }
    
    // Default fallback
    if (process.env.ANTHROPIC_API_KEY) return 'claude'
    if (process.env.OPENAI_API_KEY) return 'openai'
    
    // If neither is available, default to claude
    console.warn('No AI provider API keys found - AI features may not work')
    return 'claude'
    */
  }

  static async generateStatusSummary(containerData: ContainerData, preferredProvider?: AIProvider): Promise<string> {
    try {
      return await OpenAIService.generateStatusSummary(containerData)
    } catch (error) {
      console.error('Error with OpenAI:', error)
      return `Container ${containerData.container_id} is ${containerData.status.toLowerCase()} at ${containerData.current_location || 'unknown location'}.`
    }
    
    // Commented out multi-provider logic
    /*
    const provider = preferredProvider || this.getProvider()
    
    try {
      if (provider === 'openai') {
        return await OpenAIService.generateStatusSummary(containerData)
      } else {
        return await ClaudeService.generateStatusSummary(containerData)
      }
    } catch (error) {
      console.error(`Error with ${provider}, trying fallback:`, error)
      
      // Try fallback provider
      const fallbackProvider = provider === 'openai' ? 'claude' : 'openai'
      try {
        if (fallbackProvider === 'openai') {
          return await OpenAIService.generateStatusSummary(containerData)
        } else {
          return await ClaudeService.generateStatusSummary(containerData)
        }
      } catch (fallbackError) {
        console.error('Both AI providers failed:', fallbackError)
        return `Container ${containerData.container_id} is ${containerData.status.toLowerCase()} at ${containerData.current_location || 'unknown location'}.`
      }
    }
    */
  }

  static async generateDelayInsight(containerData: ContainerData, preferredProvider?: AIProvider): Promise<string> {
    try {
      return await OpenAIService.generateDelayInsight(containerData)
    } catch (error) {
      console.error('Error with OpenAI:', error)
      return 'Delay analysis unavailable.'
    }
  }

  static async generateWeeklyReport(containers: ContainerData[], preferredProvider?: AIProvider): Promise<string> {
    try {
      return await OpenAIService.generateWeeklyReport(containers)
    } catch (error) {
      console.error('Error with OpenAI:', error)
      return 'Weekly report generation failed.'
    }
  }

  static async generateAlertMessage(containerData: ContainerData, alertType: string, preferredProvider?: AIProvider): Promise<string> {
    try {
      return await OpenAIService.generateAlertMessage(containerData, alertType)
    } catch (error) {
      console.error('Error with OpenAI:', error)
      return `Alert: Container ${containerData.container_id} - ${alertType}`
    }
  }

  static getAvailableProviders(): { provider: AIProvider; available: boolean; name: string }[] {
    return [
      // {
      //   provider: 'claude',
      //   available: !!process.env.ANTHROPIC_API_KEY,
      //   name: 'Claude (Anthropic)'
      // },
      {
        provider: 'openai',
        available: !!process.env.OPENAI_API_KEY,
        name: 'GPT-4 (OpenAI)'
      }
    ]
  }

  static getCurrentProvider(): AIProvider {
    return this.getProvider()
  }
}
