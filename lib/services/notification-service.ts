import { Resend } from 'resend'
import { Database } from '@/lib/supabase/database.types'

type Alert = Database['public']['Tables']['alerts']['Row']
type Container = Database['public']['Tables']['containers']['Row']
type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

const resend = new Resend(process.env.RESEND_API_KEY)

export class NotificationService {
  static async sendEmailAlert(
    userEmail: string,
    alert: Alert,
    container: Container
  ): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured')
      return false
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'PortSense <alerts@portsense.com>',
        to: [userEmail],
        subject: `PortSense Alert: ${alert.title}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #1e40af; margin: 0;">🚢 PortSense Alert</h1>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h2 style="color: #374151; margin-top: 0;">${alert.title}</h2>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 0; color: #92400e; font-weight: 500;">
                  ${alert.message}
                </p>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
                <h3 style="color: #374151; margin-bottom: 10px;">Container Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Container ID:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${container.container_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Status:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${container.status}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Location:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${container.current_location || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Carrier:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${container.carrier || 'N/A'}</td>
                  </tr>
                  ${container.delay_hours > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Delay:</td>
                    <td style="padding: 8px 0; font-weight: 500; color: #dc2626;">${container.delay_hours} hours</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/containers/${container.id}" 
                   style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Container Details
                </a>
              </div>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
              <p>You're receiving this because you have alerts enabled for container tracking.</p>
              <p>Visit your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">notification settings</a> to manage preferences.</p>
            </div>
          </div>
        `,
      })

      if (error) {
        console.error('Email sending error:', error)
        return false
      }

      console.log('Email sent successfully:', data?.id)
      return true
    } catch (error) {
      console.error('Email notification error:', error)
      return false
    }
  }

  static async sendSMSAlert(
    phoneNumber: string,
    alert: Alert,
    container: Container
  ): Promise<boolean> {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('Twilio credentials not configured')
      return false
    }

    try {
      // Initialize Twilio client
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )

      const message = `PortSense Alert: ${alert.title}\n\n${alert.message}\n\nContainer: ${container.container_id}\nStatus: ${container.status}\nLocation: ${container.current_location || 'Unknown'}\n\nView details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/containers/${container.id}`

      const result = await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      })

      console.log('SMS sent successfully:', result.sid)
      return true
    } catch (error) {
      console.error('SMS notification error:', error)
      return false
    }
  }

  static async sendSlackAlert(
    webhookUrl: string,
    alert: Alert,
    container: Container
  ): Promise<boolean> {
    try {
      const slackMessage = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚢 PortSense Alert',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${alert.title}*\n${alert.message}`,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Container:*\n${container.container_id}`,
              },
              {
                type: 'mrkdwn',
                text: `*Status:*\n${container.status}`,
              },
              {
                type: 'mrkdwn',
                text: `*Location:*\n${container.current_location || 'Unknown'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Carrier:*\n${container.carrier || 'N/A'}`,
              },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Details',
                },
                url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/containers/${container.id}`,
              },
            ],
          },
        ],
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      })

      if (response.ok) {
        console.log('Slack notification sent successfully')
        return true
      } else {
        console.error('Slack notification failed:', response.statusText)
        return false
      }
    } catch (error) {
      console.error('Slack notification error:', error)
      return false
    }
  }

  static async sendNotifications(
    userId: string,
    userEmail: string,
    alert: Alert,
    container: Container,
    preferences?: UserPreferences
  ): Promise<{
    email: boolean
    sms: boolean
    slack: boolean
  }> {
    const results = {
      email: false,
      sms: false,
      slack: false,
    }

    // Send email if enabled
    if (preferences?.email_alerts !== false) {
      results.email = await this.sendEmailAlert(userEmail, alert, container)
    }

    // Send SMS if enabled and phone number available
    if (preferences?.sms_alerts && process.env.USER_PHONE_NUMBER) {
      results.sms = await this.sendSMSAlert(
        process.env.USER_PHONE_NUMBER,
        alert,
        container
      )
    }

    // Send Slack if webhook URL available
    if (preferences?.slack_webhook_url) {
      results.slack = await this.sendSlackAlert(
        preferences.slack_webhook_url,
        alert,
        container
      )
    }

    return results
  }
}