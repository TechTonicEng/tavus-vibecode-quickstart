export interface Student {
  id: string
  name: string
  grade: number
  class_id: string
  created_at: string
}

export interface Session {
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

export interface Educator {
  id: string
  name: string
  email: string
  class_ids: string[]
  created_at: string
}

export interface MoodOption {
  emoji: string
  label: string
  value: string
  color: string
  description: string
}

export interface SELSkill {
  id: string
  title: string
  description: string
  instructions: string[]
  category: 'breathing' | 'mindfulness' | 'reframing' | 'social'
  duration: number
}

export interface ConversationResponse {
  conversation_id: string
  conversation_url: string
  status: string
}