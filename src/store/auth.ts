import { atom } from 'jotai'
import { Student, Educator } from '@/types'

export interface AuthState {
  isAuthenticated: boolean
  userType: 'student' | 'staff' | null
  token: string | null
  expiresAt: string | null
}

export const authStateAtom = atom<AuthState>({
  isAuthenticated: false,
  userType: null,
  token: null,
  expiresAt: null
})

// Create atoms with explicit initial values
export const currentStudentAtom = atom<Student | null>(null)
export const currentEducatorAtom = atom<Educator | null>(null)

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated)

// Action atom for logout that properly clears everything
export const logoutAtom = atom(
  null,
  (get, set) => {
    console.log('logoutAtom: Clearing all auth state')
    
    // Clear auth state
    set(authStateAtom, {
      isAuthenticated: false,
      userType: null,
      token: null,
      expiresAt: null
    })
    
    // Clear user atoms
    set(currentStudentAtom, null)
    set(currentEducatorAtom, null)
    
    // Clear localStorage
    localStorage.removeItem('tess_auth_token')
    localStorage.removeItem('tess_user_data')
    localStorage.removeItem('tess_user_type')
    localStorage.removeItem('tess_expires_at')
    
    console.log('logoutAtom: All state cleared')
  }
)

// Debug atom to track currentStudent changes
export const debugCurrentStudentAtom = atom(
  (get) => {
    const student = get(currentStudentAtom)
    console.log('debugCurrentStudentAtom: currentStudent value:', student)
    return student
  }
)