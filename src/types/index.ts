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
  context_tag?: string
  transcript: string
  flags: string[]
  duration: number
  journal_entry?: string
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
  image?: string
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

export interface ContextTag {
  id: string
  label: string
  emoji: string
  color: string
}

export interface SELGoal {
  id: string
  title: string
  description: string
  category: 'emotional-regulation' | 'social-skills' | 'self-awareness' | 'responsible-decision-making'
  icon: string
}

export interface StudentGoal {
  id: string
  student_id: string
  goal_id: string
  week_start: string
  progress: number[]
  completed: boolean
  created_at: string
}

export interface JournalEntry {
  id: string
  session_id: string
  student_id: string
  prompt: string
  response: string
  created_at: string
}

export interface FavoriteSkill {
  id: string
  student_id: string
  skill_id: string
  created_at: string
}

export interface MiniGame {
  id: string
  title: string
  description: string
  type: 'matching' | 'scenario' | 'quiz'
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  content: any
}

export interface GameSession {
  id: string
  student_id: string
  game_id: string
  score: number
  completed: boolean
  duration: number
  created_at: string
}