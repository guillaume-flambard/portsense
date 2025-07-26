import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required')
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export { anthropic }

// lib/ai/prompts.ts
export const AI_PROMPTS = {
  statusSummary: (containerData: any) => `
You are a logistics AI assistant for PortSense. Generate a concise, professional status summary for this container.

Container Data:
${JSON.stringify(containerData, null, 2)}

Requirements:
- Maximum 3 lines
- Business-professional tone
- Include key status, location, and any delays
- If delayed, mention likely cause
- End with ETA if available

Format your response as plain text without markdown.
`,

  delayInsight: (containerData: any) => `
You are a logistics AI assistant. Analyze this container's delay and provide insights.

Container Data:
${JSON.stringify(containerData, null, 2)}

Provide:
1. Most likely cause of delay (1-2 sentences)
2. Potential impact assessment (Low/Medium/High)
3. Recommended action for logistics team (1 sentence)

Keep response under 100 words, professional tone.
`,

  weeklyReport: (containers: any[]) => `
You are a logistics AI assistant. Generate a weekly summary report for these containers.

Container Data:
${JSON.stringify(containers, null, 2)}

Include:
- Total containers tracked
- On-time vs delayed percentages
- Top 3 delay causes
- Carrier performance summary
- Risk assessment for upcoming week

Format as a professional report, maximum 200 words.
`,

  alertMessage: (containerData: any, alertType: string) => `
Generate a concise alert message for ${alertType}.

Container: ${containerData.container_id}
Status: ${containerData.status}
Location: ${containerData.current_location}
Delay: ${containerData.delay_hours}h
Issues: ${containerData.issues?.join(', ') || 'None'}

Create a professional alert message under 50 words suitable for email/SMS.
`
}