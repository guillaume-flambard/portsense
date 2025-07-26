import { ContainerData } from './claude-service'

export const AI_PROMPTS = {
  statusSummary: (data: ContainerData) => `
Generate a concise status summary for container ${data.container_id}:
- Status: ${data.status}
- Current Location: ${data.current_location || 'Unknown'}
- Origin: ${data.origin_port || 'Unknown'}
- Destination: ${data.destination_port || 'Unknown'}
- Carrier: ${data.carrier || 'Unknown'}
- Vessel: ${data.vessel_name || 'Unknown'}
- ETA: ${data.eta || 'Unknown'}
- Delay: ${data.delay_hours} hours
- Issues: ${data.issues?.join(', ') || 'None'}

Provide a professional, concise summary in 1-2 sentences.
  `,

  delayInsight: (data: ContainerData) => `
Analyze the delay for container ${data.container_id}:
- Current delay: ${data.delay_hours} hours
- Status: ${data.status}
- Location: ${data.current_location || 'Unknown'}
- Issues: ${data.issues?.join(', ') || 'None'}
- Carrier: ${data.carrier || 'Unknown'}

Provide insight into potential causes and impact of this delay in 1-2 sentences.
  `,

  weeklyReport: (containers: ContainerData[]) => `
Generate a weekly summary report for ${containers.length} containers:

${containers.map(c => `
- ${c.container_id}: ${c.status}, ${c.delay_hours}h delay, ${c.current_location || 'Unknown location'}
`).join('')}

Provide a professional executive summary highlighting key metrics, trends, and issues requiring attention.
  `,

  alertMessage: (data: ContainerData, alertType: string) => `
Generate an alert message for container ${data.container_id}:
- Alert Type: ${alertType}
- Status: ${data.status}
- Location: ${data.current_location || 'Unknown'}
- Delay: ${data.delay_hours} hours
- Issues: ${data.issues?.join(', ') || 'None'}

Create a clear, actionable alert message in 1 sentence.
  `
}