import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { DailyProvider } from '@daily-co/daily-react'
import { LoginScreen } from '@/screens/LoginScreen'
import { Sidebar } from '@/components/Layout/Sidebar'
import { HomeScreen } from '@/screens/HomeScreen'
import { SessionView } from '@/components/Session/SessionView'
import { SessionComplete } from '@/screens/SessionComplete'
import { 
  authStateAtom, 
  currentStudentAtom, 
  currentEducatorAtom,
  logoutAtom
} from '@/store/auth'
import { conversationAtom } from '@/store/conversation'
import { selectedMoodAtom, selectedSkillAtom, currentSessionAtom } from '@/store/session'
import { createConversation } from '@/api/conversation'
import { createSession } from '@/api/sessions'
import { authenticateStudentQR, authenticateStaff } from '@/api/auth'

type AppView = 'home' | 'session' | 'complete' | 'sessions' | 'skills' | 'settings' | 'profile'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [authState, setAuthState] = useAtom(authStateAtom)
  const [currentStudent, setCurrentStudent] = useAtom(currentStudentAtom)
  const [currentEducator, setCurrentEducator] = useAtom(currentEducatorAtom)
  const [, logout] = useAtom(logoutAtom)
  const [conversation, setConversation] = useAtom(conversationAtom)
  const [selectedMood] = useAtom(selectedMoodAtom)
  const [selectedSkill] = useAtom(selectedSkillAtom)
  const [currentSession, setCurrentSession] = useAtom(currentSessionAtom)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('tess_auth_token')
        const userData = localStorage.getItem('tess_user_data')
        const userType = localStorage.getItem('tess_user_type') as 'student' | 'staff' | null
        const expiresAt = localStorage.getItem('tess_expires_at')

        console.log('Initializing auth with:', { token: !!token, userData: !!userData, userType, expiresAt })

        if (token && userData && userType && expiresAt) {
          // Check if token is expired
          const now = new Date()
          const expiry = new Date(expiresAt)
          
          if (now < expiry) {
            const parsedUserData = JSON.parse(userData)
            console.log('Restoring auth state:', { userType, parsedUserData })
            
            setAuthState({
              isAuthenticated: true,
              userType,
              token,
              expiresAt
            })

            if (userType === 'student') {
              setCurrentStudent(parsedUserData)
              console.log('Set currentStudent from localStorage:', parsedUserData)
            } else {
              setCurrentEducator(parsedUserData)
              console.log('Set currentEducator from localStorage:', parsedUserData)
            }
          } else {
            // Token expired, clear everything
            console.log('Token expired, clearing auth')
            logout()
          }
        } else {
          console.log('No valid auth data found in localStorage')
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error)
        logout()
      }
    }

    initializeAuth()
  }, [setAuthState, setCurrentStudent, setCurrentEducator, logout])

  const handleStudentLogin = async (qrData: string) => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      console.log('Attempting QR login with:', qrData)
      const authResponse = await authenticateStudentQR(qrData)
      console.log('QR auth response:', authResponse)
      
      // Set auth state
      setAuthState({
        isAuthenticated: true,
        userType: 'student',
        token: authResponse.token,
        expiresAt: authResponse.expires_at
      })
      
      // Set current student
      setCurrentStudent(authResponse.student)
      console.log('Set currentStudent after QR login:', authResponse.student)
      
      // Store in localStorage
      localStorage.setItem('tess_auth_token', authResponse.token)
      localStorage.setItem('tess_user_data', JSON.stringify(authResponse.student))
      localStorage.setItem('tess_user_type', 'student')
      localStorage.setItem('tess_expires_at', authResponse.expires_at)
      
    } catch (error) {
      console.error('Student login failed:', error)
      setAuthError('Failed to authenticate QR code. Please try again.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleStudentSignup = async (name: string, grade: number, classId: string) => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      console.log('Creating student account:', { name, grade, classId })
      
      // Create a mock student for demo purposes
      const mockStudent = {
        id: `student_${Date.now()}`,
        name,
        grade,
        class_id: classId,
        created_at: new Date().toISOString()
      }
      
      const token = `student_${mockStudent.id}_${Date.now()}`
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      
      console.log('Created mock student:', mockStudent)
      
      // Set auth state
      setAuthState({
        isAuthenticated: true,
        userType: 'student',
        token,
        expiresAt
      })
      
      // Set current student
      setCurrentStudent(mockStudent)
      console.log('Set currentStudent after signup:', mockStudent)
      
      // Store in localStorage
      localStorage.setItem('tess_auth_token', token)
      localStorage.setItem('tess_user_data', JSON.stringify(mockStudent))
      localStorage.setItem('tess_user_type', 'student')
      localStorage.setItem('tess_expires_at', expiresAt)
      
    } catch (error) {
      console.error('Student signup failed:', error)
      setAuthError('Failed to create account. Please try again.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleStudentSignin = async () => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      console.log('Demo student signin')
      
      // Create a demo student
      const demoStudent = {
        id: 'demo_student_123',
        name: 'Demo Student',
        grade: 4,
        class_id: 'demo-class',
        created_at: new Date().toISOString()
      }
      
      const token = `student_demo_${Date.now()}`
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      
      console.log('Created demo student:', demoStudent)
      
      // Set auth state
      setAuthState({
        isAuthenticated: true,
        userType: 'student',
        token,
        expiresAt
      })
      
      // Set current student
      setCurrentStudent(demoStudent)
      console.log('Set currentStudent after demo signin:', demoStudent)
      
      // Store in localStorage
      localStorage.setItem('tess_auth_token', token)
      localStorage.setItem('tess_user_data', JSON.stringify(demoStudent))
      localStorage.setItem('tess_user_type', 'student')
      localStorage.setItem('tess_expires_at', expiresAt)
      
    } catch (error) {
      console.error('Demo signin failed:', error)
      setAuthError('Demo signin failed. Please try again.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleStaffLogin = async (email: string, password: string) => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      console.log('Attempting staff login with:', email)
      const authResponse = await authenticateStaff(email, password)
      console.log('Staff auth response:', authResponse)
      
      // Set auth state
      setAuthState({
        isAuthenticated: true,
        userType: 'staff',
        token: authResponse.token,
        expiresAt: authResponse.expires_at
      })
      
      // Set current educator
      setCurrentEducator(authResponse.educator)
      console.log('Set currentEducator after staff login:', authResponse.educator)
      
      // Store in localStorage
      localStorage.setItem('tess_auth_token', authResponse.token)
      localStorage.setItem('tess_user_data', JSON.stringify(authResponse.educator))
      localStorage.setItem('tess_user_type', 'staff')
      localStorage.setItem('tess_expires_at', authResponse.expires_at)
      
    } catch (error) {
      console.error('Staff login failed:', error)
      if (error.message.includes('Invalid credentials')) {
        setAuthError('Invalid credentials. For demo purposes, use: demo@school.edu / demo123')
      } else {
        setAuthError('Login failed. Please try again.')
      }
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleLogout = () => {
    console.log('Logging out user')
    logout()
    setCurrentView('home')
    // Reset session state
    setCurrentSession(null)
    setConversation({
      conversation_id: null,
      conversation_url: null,
      status: 'idle'
    })
  }

  const handleStartSession = async () => {
    console.log('Starting session with:', { 
      selectedMood, 
      selectedSkill, 
      currentStudent,
      authState 
    })

    if (!selectedMood || !selectedSkill) {
      console.error('Missing required data for session - mood or skill not selected')
      return
    }

    if (!currentStudent) {
      console.error('No authenticated student found')
      setAuthError('Please log in to start a session.')
      return
    }

    try {
      console.log('Starting session with:', { selectedMood, selectedSkill, student: currentStudent })

      // Create session record first
      const sessionData = {
        student_id: currentStudent.id,
        mood_emoji: selectedMood.emoji,
        mood_score: 0, // Will be updated during session
        sel_skill: selectedSkill.id,
        transcript: '',
        flags: [],
        duration: 0
      }

      const session = await createSession(sessionData)
      setCurrentSession(session)
      console.log('Session created:', session)

      // Create Tavus conversation using Edge Function
      const conversationResponse = await createConversation(
        currentStudent.id,
        selectedMood.emoji,
        selectedSkill.id
      )

      console.log('Conversation response:', conversationResponse)

      setConversation({
        conversation_id: conversationResponse.conversation_id,
        conversation_url: conversationResponse.conversation_url,
        status: 'connected'
      })

      setCurrentView('session')
    } catch (error) {
      console.error('Failed to start session:', error)
      setAuthError('Failed to start session. Please try again.')
    }
  }

  const handleSessionEnd = () => {
    setConversation({
      conversation_id: null,
      conversation_url: null,
      status: 'ended'
    })
    setCurrentView('complete')
  }

  const handleReturnHome = () => {
    setCurrentView('home')
    // Reset session state
    setCurrentSession(null)
    setConversation({
      conversation_id: null,
      conversation_url: null,
      status: 'idle'
    })
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeScreen onStartSession={handleStartSession} />
      case 'session':
        return <SessionView onSessionEnd={handleSessionEnd} />
      case 'complete':
        return <SessionComplete onReturnHome={handleReturnHome} />
      case 'sessions':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Sessions</h1>
            <p className="text-gray-600">Your session history will appear here.</p>
          </div>
        )
      case 'skills':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">SEL Skills Library</h1>
            <p className="text-gray-600">Browse all available skills here.</p>
          </div>
        )
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
            <p className="text-gray-600">Adjust your preferences here.</p>
          </div>
        )
      case 'profile':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h1>
            <p className="text-gray-600">View your profile information here.</p>
          </div>
        )
      default:
        return <HomeScreen onStartSession={handleStartSession} />
    }
  }

  // Show login screen if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <DailyProvider>
        <LoginScreen
          onStudentLogin={handleStudentLogin}
          onStudentSignup={handleStudentSignup}
          onStudentSignin={handleStudentSignin}
          onStaffLogin={handleStaffLogin}
          isLoading={isAuthLoading}
          authError={authError}
        />
      </DailyProvider>
    )
  }

  return (
    <DailyProvider>
      <div className="h-screen flex bg-gray-50">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onLogout={handleLogout}
          userType={authState.userType}
          currentUser={currentStudent || currentEducator}
        />
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </DailyProvider>
  )
}

export default App