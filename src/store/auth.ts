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

export const currentStudentAtom = atom<Student | null>(null)
export const currentEducatorAtom = atom<Educator | null>(null)

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated)

// Action atoms for authentication
export const loginStudentAtom = atom(
  null,
  (get, set, { student, token, expiresAt }: { student: Student; token: string; expiresAt: string }) => {
    set(authStateAtom, {
      isAuthenticated: true,
      userType: 'student',
      token,
      expiresAt
    })
    set(currentStudentAtom, student)
    
    // Store in localStorage for persistence
    localStorage.setItem('tess_auth_token', token)
    localStorage.setItem('tess_user_data', JSON.stringify(student))
    localStorage.setItem('tess_user_type', 'student')
    localStorage.setItem('tess_expires_at', expiresAt)
  }
)

export const loginStaffAtom = atom(
  null,
  (get, set, { educator, token, expiresAt }: { educator: Educator; token: string; expiresAt: string }) => {
    set(authStateAtom, {
      isAuthenticated: true,
      userType: 'staff',
      token,
      expiresAt
    })
    set(currentEducatorAtom, educator)
    
    // Store in localStorage for persistence
    localStorage.setItem('tess_auth_token', token)
    localStorage.setItem('tess_user_data', JSON.stringify(educator))
    localStorage.setItem('tess_user_type', 'staff')
    localStorage.setItem('tess_expires_at', expiresAt)
  }
)

export const logoutAtom = atom(
  null,
  (get, set) => {
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
  }
)

// Initialize auth state from localStorage
export const initializeAuthAtom = atom(
  null,
  (get, set) => {
    try {
      const token = localStorage.getItem('tess_auth_token')
      const userData = localStorage.getItem('tess_user_data')
      const userType = localStorage.getItem('tess_user_type') as 'student' | 'staff' | null
      const expiresAt = localStorage.getItem('tess_expires_at')

      if (token && userData && userType && expiresAt) {
        // Check if token is expired
        const now = new Date()
        const expiry = new Date(expiresAt)
        
        if (now < expiry) {
          const parsedUserData = JSON.parse(userData)
          
          set(authStateAtom, {
            isAuthenticated: true,
            userType,
            token,
            expiresAt
          })

          if (userType === 'student') {
            set(currentStudentAtom, parsedUserData)
          } else {
            set(currentEducatorAtom, parsedUserData)
          }
        } else {
          // Token expired, clear everything
          set(logoutAtom)
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error)
      set(logoutAtom)
    }
  }
)