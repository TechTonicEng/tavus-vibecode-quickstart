import { atom } from 'jotai'

export interface ConversationState {
  conversation_id: string | null
  conversation_url: string | null
  status: 'idle' | 'connecting' | 'connected' | 'ended'
}

export const conversationAtom = atom<ConversationState>({
  conversation_id: null,
  conversation_url: null,
  status: 'idle'
})