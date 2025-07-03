import { supabase } from '@/lib/supabase'
import { Session } from '@/types'

export const createSession = async (sessionData: Omit<Session, 'id' | 'created_at'>): Promise<Session> => {
  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`)
  }

  return data
}

export const updateSession = async (sessionId: string, updates: Partial<Session>): Promise<Session> => {
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update session: ${error.message}`)
  }

  return data
}

export const getStudentSessions = async (studentId: string): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`)
  }

  return data || []
}