import { atom } from 'jotai'
import { Session, MoodOption, SELSkill } from '@/types'

export const currentSessionAtom = atom<Session | null>(null)
export const selectedMoodAtom = atom<MoodOption | null>(null)
export const selectedSkillAtom = atom<SELSkill | null>(null)
export const sessionTranscriptAtom = atom<string>('')
export const sessionStartTimeAtom = atom<Date | null>(null)