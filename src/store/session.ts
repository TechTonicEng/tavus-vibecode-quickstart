import { atom } from 'jotai'
import { Session, MoodOption, SELSkill, ContextTag, SELGoal, StudentGoal, FavoriteSkill } from '@/types'

export const currentSessionAtom = atom<Session | null>(null)
export const selectedMoodAtom = atom<MoodOption | null>(null)
export const selectedSkillAtom = atom<SELSkill | null>(null)
export const selectedContextTagAtom = atom<ContextTag | null>(null)
export const sessionTranscriptAtom = atom<string>('')
export const sessionStartTimeAtom = atom<Date | null>(null)

// Goal tracking atoms
export const currentGoalAtom = atom<SELGoal | null>(null)
export const studentGoalAtom = atom<StudentGoal | null>(null)

// Favorite skills atoms
export const favoriteSkillsAtom = atom<FavoriteSkill[]>([])

// Journal atoms
export const journalPromptAtom = atom<string>('')
export const showJournalPromptAtom = atom<boolean>(false)