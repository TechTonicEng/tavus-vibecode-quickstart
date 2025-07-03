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

// Simple atoms without complex setters to avoid issues
export const currentStudentAtom = atom<Student | null>(null)
export const currentEducatorAtom = atom<Educator | null>(null)

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated)

// Action atom for logout
export const logoutAtom = atom(
  null,
  (get, set) => {
    console.log('logoutAtom: Logging out user')
    
    set(authStateAtom, {
      isAuthenticated: false,
      userType: null,
      token: null,
      expiresAt: null
    })
    
    set(currentStudentAtom, null)
    set(currentEducatorAtom, null)
    
    // Clear localStorage
    localStorage.removeItem('tess_auth_token')
    localStorage.removeItem('tess_user_data')
    localStorage.removeItem('tess_user_type')
    localStorage.removeItem('tess_expires_at')
    
    console.log('logoutAtom: Logout complete')
  }
)