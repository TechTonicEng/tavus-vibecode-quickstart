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

// Create atoms with explicit initial values and debug logging
export const currentStudentAtom = atom<Student | null>(
  null,
  (get, set, newValue: Student | null) => {
    console.log('currentStudentAtom: Setting value to:', newValue)
    set(currentStudentAtom, newValue)
  }
)

export const currentEducatorAtom = atom<Educator | null>(
  null,
  (get, set, newValue: Educator | null) => {
    console.log('currentEducatorAtom: Setting value to:', newValue)
    set(currentEducatorAtom, newValue)
  }
)

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated)

// Action atoms for authentication
export const loginStudentAtom = atom(
  null,
  (get, set, { student, token, expiresAt }: { student: Student; token: string; expiresAt: string }) => {
    console.log('loginStudentAtom: Logging in student:', student)
    
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
    
    console.log('loginStudentAtom: Student login complete')
  }
)

export const loginStaffAtom = atom(
  null,
  (get, set, { educator, token, expiresAt }: { educator: Educator; token: string; expiresAt: string }) => {
    console.log('loginStaffAtom: Logging in educator:', educator)
    
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
    
    console.log('loginStaffAtom: Staff login complete')
  }
)

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

// Initialize auth state from localStorage
export const initializeAuthAtom = atom(
  null,
  (get, set) => {
    try {
      console.log('initializeAuthAtom: Initializing auth from localStorage')
      
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
          
          console.log('initializeAuthAtom: Restoring auth state for:', userType, parsedUserData)
          
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
          
          console.log('initializeAuthAtom: Auth state restored successfully')
        } else {
          // Token expired, clear everything
          console.log('initializeAuthAtom: Token expired, clearing auth')
          set(logoutAtom)
        }
      } else {
        console.log('initializeAuthAtom: No valid auth data found')
      }
    } catch (error) {
      console.error('initializeAuthAtom: Failed to initialize auth state:', error)
      set(logoutAtom)
    }
  }
)