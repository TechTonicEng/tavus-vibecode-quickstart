import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { LoginScreen } from '@/screens/LoginScreen'
import { Sidebar } from '@/components/Layout/Sidebar'
import { HomeScreen } from '@/screens/HomeScreen'
import { SessionView } from '@/components/Session/SessionView'
import { SessionComplete } from '@/screens/SessionComplete'
import { 
  authStateAtom, 
  currentStudentAtom, 
  currentEducatorAtom
} from '@/store/auth'
import { conversationAtom } from '@/store/conversation'
import { selectedMoodAtom, selectedSkillAtom, currentSessionAtom } from '@/store/session'
import { createConversation } from '@/api/conversation'
import { createSession } from '@/api/sessions'
import { authenticateStudentQR, authenticateStaff } from '@/api/auth'

type AppView = 'home' | 'session' | 'complete' | 'sessions' | 'skills' | 'settings' | 'profile'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home')
  // Ensure the setter matches Sidebar’s expected type
  const handleViewChange = (view: string) => setCurrentView(view as AppView)
  const [authState, setAuthState] = useAtom(authStateAtom)
  const [currentStudent, setCurrentStudent] = useAtom(currentStudentAtom)
  const [currentEducator, setCurrentEducator] = useAtom(currentEducatorAtom)
  const [conversation, setConversation] = useAtom(conversationAtom)
  const [selectedMood] = useAtom(selectedMoodAtom)
  const [selectedSkill] = useAtom(selectedSkillAtom)
  const [currentSession, setCurrentSession] = useAtom(currentSessionAtom)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Debug logging for currentStudent changes
  useEffect(() => {
    console.log('App: currentStudent atom changed:', currentStudent)
  }, [currentStudent])

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('App: Starting auth initialization...')
        const token = localStorage.getItem('tess_auth_token')
        const userData = localStorage.getItem('tess_user_data')
        const userType = localStorage.getItem('tess_user_type') as 'student' | 'staff' | null
        const expiresAt = localStorage.getItem('tess_expires_at')

        console.log('App: Auth data from localStorage:', { 
          hasToken: !!token, 
          hasUserData: !!userData, 
          userType, 
          expiresAt 
        })

        if (token && userData && userType && expiresAt) {
          // Check if token is expired
          const now = new Date()
          const expiry = new Date(expiresAt)
          
          if (now < expiry) {
            const parsedUserData = JSON.parse(userData)
            console.log('App: Restoring auth state:', { userType, parsedUserData })
            
            // Set auth state first
            setAuthState({
              isAuthenticated: true,
              userType,
              token,
              expiresAt
            })

            // Then set user data
            if (userType === 'student') {
              console.log('App: Setting currentStudent from localStorage:', parsedUserData)
              setCurrentStudent(parsedUserData)
            } else {
              console.log('App: Setting currentEducator from localStorage:', parsedUserData)
              setCurrentEducator(parsedUserData)
            }
          } else {
            // Token expired, clear everything
            console.log('App: Token expired, clearing auth')
            handleLogout()
          }
        } else {
          console.log('App: No valid auth data found in localStorage')
        }
      } catch (error) {
        console.error('App: Failed to initialize auth state:', error)
        handleLogout()
      } finally {
        setIsInitialized(true)
        console.log('App: Auth initialization complete')
      }
    }

    initializeAuth()
  }, [])

  const handleStudentLogin = async (qrData: string) => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      console.log('App: Attempting QR login with:', qrData)
      const authResponse = await authenticateStudentQR(qrData)
      console.log('App: QR auth response:', authResponse)
      
      // Set auth state first
      setAuthState({
        isAuthenticated: true,
        userType: 'student',
        token: authResponse.token,
        expiresAt: authResponse.expires_at
      })
      
      // Set currentStudent immediately after auth state
      console.log('App: Setting currentStudent after QR login:', authResponse.student)
      setCurrentStudent(authResponse.student)
      
      // Store in localStorage
      localStorage.setItem('tess_auth_token', authResponse.token)
      localStorage.setItem('tess_user_data', JSON.stringify(authResponse.student))
      localStorage.setItem('tess_user_type', 'student')
      localStorage.setItem('tess_expires_at', authResponse.expires_at)
      
      console.log('App: QR login complete')
      
    } catch (error) {
      console.error('App: Student login failed:', error)
      setAuthError('Failed to authenticate QR code. Please try again.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleStudentSignup = async (name: string, grade: number, classId: string) => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      console.log('App: Creating student account:', { name, grade, classId })
      
      const newStudent = {
        id: `student_${Date.now()}`,
        name,
        grade,
        class_id: classId,
        created_at: new Date().toISOString()
      }
      
      const token = `student_${newStudent.id}_${Date.now()}`
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      
      console.log('App: Created student:', newStudent)
      
      // Set auth state first
      setAuthState({
        isAuthenticated: true,
        userType: 'student',
        token,
        expiresAt
      })
      
      // Set currentStudent immediately after auth state
      console.log('App: Setting currentStudent after signup:', newStudent)
      setCurrentStudent(newStudent)
      
      // Store in localStorage
      localStorage.setItem('tess_auth_token', token)
      localStorage.setItem('tess_user_data', JSON.stringify(newStudent))
      localStorage.setItem('tess_user_type', 'student')
      localStorage.setItem('tess_expires_at', expiresAt)
      
      console.log('App: Student signup complete')
      
    } catch (error) {
      console.error('App: Student signup failed:', error)
      setAuthError('Failed to create account. Please try again.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleStudentSignin = async () => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      console.log('App: Demo student signin')
      
      const demoStudent = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Demo Student',
        grade: 4,
        class_id: 'demo-class',
        created_at: new Date().toISOString()
      }
      
      const token = `student_demo_${Date.now()}`
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      
      console.log('App: Created demo student:', demoStudent)
      
      // Set auth state first
      setAuthState({
        isAuthenticated: true,
        userType: 'student',
        token,
        expiresAt
      })
      
      // Set currentStudent immediately after auth state
      console.log('App: Setting currentStudent after demo signin:', demoStudent)
      setCurrentStudent(demoStudent)
      
      // Store in localStorage
      localStorage.setItem('tess_auth_token', token)
      localStorage.setItem('tess_user_data', JSON.stringify(demoStudent))
      localStorage.setItem('tess_user_type', 'student')
      localStorage.setItem('tess_expires_at', expiresAt)
      
      console.log('App: Demo signin complete')
      
    } catch (error) {
      console.error('App: Demo signin failed:', error)
      setAuthError('Demo signin failed. Please try again.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleStaffLogin = async (email: string, password: string) => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      console.log('App: Attempting staff login with:', email)
      const authResponse = await authenticateStaff(email, password)
      console.log('App: Staff auth response:', authResponse)
      
      // Set auth state
      setAuthState({
        isAuthenticated: true,
        userType: 'staff',
        token: authResponse.token,
        expiresAt: authResponse.expires_at
      })
      
      // Set current educator
      setCurrentEducator(authResponse.educator)
      console.log('App: Set currentEducator after staff login:', authResponse.educator)
      
      // Store in localStorage
      localStorage.setItem('tess_auth_token', authResponse.token)
      localStorage.setItem('tess_user_data', JSON.stringify(authResponse.educator))
      localStorage.setItem('tess_user_type', 'staff')
      localStorage.setItem('tess_expires_at', authResponse.expires_at)
      
    } catch (error) {
      console.error('App: Staff login failed:', error)
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
    console.log('App: Logging out user')
    
    // Clear auth state
    setAuthState({
      isAuthenticated: false,
      userType: null,
      token: null,
      expiresAt: null
    })
    
    // Clear user atoms
    setCurrentStudent(null)
    setCurrentEducator(null)
    
    // Clear localStorage
    localStorage.removeItem('tess_auth_token')
    localStorage.removeItem('tess_user_data')
    localStorage.removeItem('tess_user_type')
    localStorage.removeItem('tess_expires_at')
    
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
    console.log('App: Starting session with:', { 
      selectedMood, 
      selectedSkill, 
      currentStudent,
      authState 
    })

    // SIMPLIFIED VALIDATION - Only check mood and skill
    console.log('App: selectedMood:', selectedMood)
    console.log('App: selectedSkill:', selectedSkill)

    // Validate that we have both mood and skill selected
    if (!selectedMood || !selectedSkill) {
      console.error('App: Missing required data for session - mood or skill not selected')
      console.error('App: selectedMood:', selectedMood)
      console.error('App: selectedSkill:', selectedSkill)
      setAuthError('Please select both a mood and a skill before starting.')
      return
    }

    // Use currentStudent or fallback for session creation
    const studentForSession = currentStudent || {
      id: 'hardcoded_student_123',
      name: 'Test Student',
      grade: 4,
      class_id: 'test-class',
      created_at: new Date().toISOString()
    }

    try {
      console.log('App: Starting session with:', { selectedMood, selectedSkill, student: studentForSession })

      // Create session record first
      const sessionData = {
        student_id: studentForSession.id,
        mood_emoji: selectedMood.emoji,
        mood_score: 0, // Will be updated during session
        sel_skill: selectedSkill.id,
        transcript: '',
        flags: [],
        duration: 0
      }

      const session = await createSession(sessionData)
      setCurrentSession(session)
      console.log('App: Session created:', session)

      // Create Tavus conversation using Edge Function
      const conversationResponse = await createConversation(
        studentForSession.id,
        selectedMood.emoji,
        selectedSkill.id
      )

      console.log('App: Conversation response:', conversationResponse)

      setConversation({
        conversation_id: conversationResponse.conversation_id,
        conversation_url: conversationResponse.conversation_url,
        status: 'connected'
      })

      setCurrentView('session')
    } catch (error) {
      console.error('App: Failed to start session:', error)
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

  // Debug: Log current state
  console.log('App render - Auth State:', authState)
  console.log('App render - Current Student:', currentStudent)
  console.log('App render - Current Educator:', currentEducator)
  console.log('App render - Is Initialized:', isInitialized)

  // Wait for initialization to complete before rendering
  if (!isInitialized) {
    return (
      <>
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  // Show login screen if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <>
        <LoginScreen
          onStudentLogin={handleStudentLogin}
          onStudentSignup={handleStudentSignup}
          onStudentSignin={handleStudentSignin}
          onStaffLogin={handleStaffLogin}
          isLoading={isAuthLoading}
          authError={authError}
        />
      </>
    )
  }

  return (
    <>
      <div className="h-screen flex bg-gray-50">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          userType={authState.userType}
          currentUser={currentStudent || currentEducator}
        />
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </>
  )
}

export default App