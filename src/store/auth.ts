import { atom } from 'jotai'
import { Student } from '@/types'

export const currentStudentAtom = atom<Student | null>(null)
export const isAuthenticatedAtom = atom<boolean>(false)