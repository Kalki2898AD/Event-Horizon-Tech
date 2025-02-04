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
      articles: {
        Row: {
          id: string
          title: string
          description: string
          url: string
          urlToImage: string | null
          publishedAt: string
          source: { name: string }
          content: string
          created_at: string
          user_email: string | null
          byline: string | null
          siteName: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          url: string
          urlToImage?: string | null
          publishedAt: string
          source: { name: string }
          content: string
          created_at?: string
          user_email?: string | null
          byline?: string | null
          siteName?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          url?: string
          urlToImage?: string | null
          publishedAt?: string
          source?: { name: string }
          content?: string
          created_at?: string
          user_email?: string | null
          byline?: string | null
          siteName?: string | null
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          frequency: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          frequency: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          frequency?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
