import { supabase } from '@/lib/supabase'
import { ConversationResponse } from '@/types'

export const createConversation = async (
  studentId: string,
  mood: string,
  selSkill: string
): Promise<ConversationResponse> => {
  try {
    // Call our edge function to create conversation
    const { data, error } = await supabase.functions.invoke('create-conversation', {
      body: {
        student_id: studentId,
        mood: mood,
        sel_skill: selSkill
      }
    })

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error creating conversation:', error)
    throw error
  }
}

export const endConversation = async (conversationId: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('end-conversation', {
      body: {
        conversation_id: conversationId
      }
    })

    if (error) {
      throw new Error(`Failed to end conversation: ${error.message}`)
    }
  } catch (error) {
    console.error('Error ending conversation:', error)
    throw error
  }
}