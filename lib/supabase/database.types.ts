export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      containers: {
        Row: {
          id: string
          container_id: string
          user_id: string
          carrier: string | null
          vessel_name: string | null
          voyage_number: string | null
          status: string
          current_location: string | null
          origin_port: string | null
          destination_port: string | null
          latitude: number | null
          longitude: number | null
          eta: string | null
          original_eta: string | null
          delay_hours: number
          issues: string[] | null
          ai_summary: string | null
          risk_level: string
          last_updated: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          container_id: string
          user_id: string
          carrier?: string | null
          vessel_name?: string | null
          voyage_number?: string | null
          status?: string
          current_location?: string | null
          origin_port?: string | null
          destination_port?: string | null
          latitude?: number | null
          longitude?: number | null
          eta?: string | null
          original_eta?: string | null
          delay_hours?: number
          issues?: string[] | null
          ai_summary?: string | null
          risk_level?: string
          last_updated?: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          container_id?: string
          user_id?: string
          carrier?: string | null
          vessel_name?: string | null
          voyage_number?: string | null
          status?: string
          current_location?: string | null
          origin_port?: string | null
          destination_port?: string | null
          latitude?: number | null
          longitude?: number | null
          eta?: string | null
          original_eta?: string | null
          delay_hours?: number
          issues?: string[] | null
          ai_summary?: string | null
          risk_level?: string
          last_updated?: string
          created_at?: string
          is_active?: boolean
        }
      }
      alerts: {
        Row: {
          id: string
          container_id: string
          user_id: string
          alert_type: string
          severity: string
          title: string
          message: string
          ai_generated: boolean
          email_sent: boolean
          sms_sent: boolean
          slack_sent: boolean
          created_at: string
          acknowledged_at: string | null
        }
        Insert: {
          id?: string
          container_id: string
          user_id: string
          alert_type: string
          severity?: string
          title: string
          message: string
          ai_generated?: boolean
          email_sent?: boolean
          sms_sent?: boolean
          slack_sent?: boolean
          created_at?: string
          acknowledged_at?: string | null
        }
        Update: {
          id?: string
          container_id?: string
          user_id?: string
          alert_type?: string
          severity?: string
          title?: string
          message?: string
          ai_generated?: boolean
          email_sent?: boolean
          sms_sent?: boolean
          slack_sent?: boolean
          created_at?: string
          acknowledged_at?: string | null
        }
      }
      container_history: {
        Row: {
          id: string
          container_id: string
          status: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          eta: string | null
          delay_hours: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          container_id: string
          status?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          eta?: string | null
          delay_hours?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          container_id?: string
          status?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          eta?: string | null
          delay_hours?: number | null
          recorded_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          email_alerts: boolean
          sms_alerts: boolean
          slack_webhook_url: string | null
          delay_threshold_hours: number
          high_risk_threshold: number
          timezone: string
          date_format: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email_alerts?: boolean
          sms_alerts?: boolean
          slack_webhook_url?: string | null
          delay_threshold_hours?: number
          high_risk_threshold?: number
          timezone?: string
          date_format?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_alerts?: boolean
          sms_alerts?: boolean
          slack_webhook_url?: string | null
          delay_threshold_hours?: number
          high_risk_threshold?: number
          timezone?: string
          date_format?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}