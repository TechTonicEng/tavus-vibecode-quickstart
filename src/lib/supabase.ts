import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          grade: number
          class_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          grade: number
          class_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          grade?: number
          class_id?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          student_id: string
          mood_emoji: string
          mood_score: number
          sel_skill: string
          transcript: string
          flags: string[]
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          mood_emoji: string
          mood_score: number
          sel_skill: string
          transcript: string
          flags?: string[]
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          mood_emoji?: string
          mood_score?: number
          sel_skill?: string
          transcript?: string
          flags?: string[]
          duration?: number
          created_at?: string
        }
      }
      educators: {
        Row: {
          id: string
          name: string
          email: string
          class_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          class_ids: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          class_ids?: string[]
          created_at?: string
        }
      }
    }
  }
}