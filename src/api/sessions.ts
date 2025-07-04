import { supabase } from '@/lib/supabase'
import { Session } from '@/types'

export const createSession = async (
  sessionData: Omit<Session, "id" | "created_at">,
): Promise<Session> => {
  // Ensure we always pass a valid UUID to satisfy the NOT-NULL / UUID constraint
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      ...sessionData,
      // runtime shape contains student_id
      // • valid UUID  ➜ use as-is
      // • demo / malformed ID ➜ generate a fresh v4 UUID client-side so the insert doesn’t fail
      student_id:
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          (sessionData as any).student_id,
        )
          ? (sessionData as any).student_id
          : crypto.randomUUID(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);

  return data;
};


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