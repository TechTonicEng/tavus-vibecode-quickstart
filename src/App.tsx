import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { Target, Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  // Define effectiveStudent for use throughout the component
  const effectiveStudent = currentStudent || {
    id: 'demo-student',
    name: 'Demo Student',
    grade: 4,
    class_id: 'demo-class',
    created_at: new Date().toISOString()
  }

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

    // Log the current atom values
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
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-tess-text mb-2">My Sessions</h1>
                <p className="text-lg text-tess-text-light">Track your emotional journey and progress</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Recent Sessions */}
                <Card className="card-tess p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-peach to-tess-yellow rounded-full flex items-center justify-center">
                      <span className="text-2xl">😊</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Today's Session</h3>
                      <p className="text-sm text-tess-text-light">Happy • Deep Breathing</p>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light">Duration: 5 minutes</p>
                </Card>
                
                <Card className="card-tess p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-blue to-tess-purple rounded-full flex items-center justify-center">
                      <span className="text-2xl">😟</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Yesterday</h3>
                      <p className="text-sm text-tess-text-light">Worried • Mindful Listening</p>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light">Duration: 7 minutes</p>
                </Card>
                
                <Card className="card-tess p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-green to-tess-yellow rounded-full flex items-center justify-center">
                      <span className="text-2xl">😌</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">2 days ago</h3>
                      <p className="text-sm text-tess-text-light">Proud • Gratitude Practice</p>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light">Duration: 4 minutes</p>
                </Card>
              </div>
              
              <Card className="card-tess p-6">
                <h2 className="text-2xl font-bold text-tess-text mb-4">Weekly Progress</h2>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="text-center">
                      <p className="text-sm text-tess-text-light mb-2">{day}</p>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        index < 3 ? 'bg-gradient-to-br from-tess-green to-tess-blue' : 'bg-tess-gray'
                      }`}>
                        {index < 3 ? '✓' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )
      case 'skills':
        return (
          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-tess-text mb-2">SEL Skills Library</h1>
                <p className="text-lg text-tess-text-light">Discover and practice emotional skills</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-blue to-tess-purple rounded-full flex items-center justify-center">
                      <span className="text-xl">🫁</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Deep Breathing</h3>
                      <span className="text-xs bg-tess-blue/20 text-tess-blue px-2 py-1 rounded-full">Breathing</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Learn to calm down with special breathing techniques</p>
                  <Button className="w-full bg-gradient-to-r from-tess-blue to-tess-purple text-white">
                    Practice Now
                  </Button>
                </Card>
                
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-green to-tess-yellow rounded-full flex items-center justify-center">
                      <span className="text-xl">🧘</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Mindful Listening</h3>
                      <span className="text-xs bg-tess-green/20 text-tess-green px-2 py-1 rounded-full">Mindfulness</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Listen carefully to sounds around you</p>
                  <Button className="w-full bg-gradient-to-r from-tess-green to-tess-yellow text-white">
                    Practice Now
                  </Button>
                </Card>
                
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-peach to-tess-pink rounded-full flex items-center justify-center">
                      <span className="text-xl">💭</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Positive Self-Talk</h3>
                      <span className="text-xs bg-tess-peach/20 text-tess-peach px-2 py-1 rounded-full">Reframing</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Say kind things to yourself</p>
                  <Button className="w-full bg-gradient-to-r from-tess-peach to-tess-pink text-white">
                    Practice Now
                  </Button>
                </Card>
                
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-yellow to-tess-orange rounded-full flex items-center justify-center">
                      <span className="text-xl">🙏</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Gratitude Practice</h3>
                      <span className="text-xs bg-tess-yellow/20 text-tess-yellow px-2 py-1 rounded-full">Mindfulness</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Think about good things in your life</p>
                  <Button className="w-full bg-gradient-to-r from-tess-yellow to-tess-orange text-white">
                    Practice Now
                  </Button>
                </Card>
                
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-purple to-tess-blue rounded-full flex items-center justify-center">
                      <span className="text-xl">🤝</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Making Friends</h3>
                      <span className="text-xs bg-tess-purple/20 text-tess-purple px-2 py-1 rounded-full">Social</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Learn how to be a good friend</p>
                  <Button className="w-full bg-gradient-to-r from-tess-purple to-tess-blue text-white">
                    Practice Now
                  </Button>
                </Card>
                
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tess-pink to-tess-peach rounded-full flex items-center justify-center">
                      <span className="text-xl">🎈</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Belly Breathing</h3>
                      <span className="text-xs bg-tess-pink/20 text-tess-pink px-2 py-1 rounded-full">Breathing</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Use your belly to breathe like a balloon</p>
                  <Button className="w-full bg-gradient-to-r from-tess-pink to-tess-peach text-white">
                    Practice Now
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )
      case 'games':
        return (
          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-tess-text mb-2">SEL Mini-Games</h1>
                <p className="text-lg text-tess-text-light">Fun games to practice emotional skills</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-tess-peach to-tess-yellow rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🧩</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Match the Feeling</h3>
                      <span className="text-xs bg-tess-peach/20 text-tess-peach px-2 py-1 rounded-full">Easy • 2 min</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Drag emotions to match the right situations</p>
                  <Button className="w-full bg-gradient-to-r from-tess-peach to-tess-yellow text-white">
                    <span className="text-xl mr-2">▶</span>
                    Play Game
                  </Button>
                </Card>
                
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-tess-blue to-tess-purple rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🎭</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">What Would You Do?</h3>
                      <span className="text-xs bg-tess-blue/20 text-tess-blue px-2 py-1 rounded-full">Medium • 3 min</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Choose the best response to different situations</p>
                  <Button className="w-full bg-gradient-to-r from-tess-blue to-tess-purple text-white">
                    <span className="text-xl mr-2">▶</span>
                    Play Game
                  </Button>
                </Card>
                
                <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-tess-green to-tess-yellow rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🕵️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-tess-text">Emotion Detective</h3>
                      <span className="text-xs bg-tess-green/20 text-tess-green px-2 py-1 rounded-full">Easy • 2.5 min</span>
                    </div>
                  </div>
                  <p className="text-sm text-tess-text-light mb-4">Identify emotions from facial expressions</p>
                  <Button className="w-full bg-gradient-to-r from-tess-green to-tess-yellow text-white">
                    <span className="text-xl mr-2">▶</span>
                    Play Game
                  </Button>
                </Card>
              </div>
              
              <Card className="card-tess p-6">
                <h2 className="text-2xl font-bold text-tess-text mb-4">Your Game Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-tess-peach/10 to-tess-yellow/10 rounded-2xl">
                    <div className="text-3xl font-bold text-tess-peach">12</div>
                    <p className="text-sm text-tess-text-light">Games Played</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-tess-blue/10 to-tess-purple/10 rounded-2xl">
                    <div className="text-3xl font-bold text-tess-blue">85%</div>
                    <p className="text-sm text-tess-text-light">Average Score</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-tess-green/10 to-tess-yellow/10 rounded-2xl">
                    <div className="text-3xl font-bold text-tess-green">7</div>
                    <p className="text-sm text-tess-text-light">Day Streak</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-tess-peach to-tess-yellow rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl font-bold text-white">{effectiveStudent?.name?.charAt(0) || 'S'}</span>
                </div>
                <h1 className="text-4xl font-bold text-tess-text mb-2">{effectiveStudent?.name || 'Student'}</h1>
                <p className="text-lg text-tess-text-light">Grade {effectiveStudent?.grade || 4} • Class {effectiveStudent?.class_id || 'demo-class'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-tess p-6">
                  <h2 className="text-2xl font-bold text-tess-text mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-tess-peach" />
                    Current Goal
                  </h2>
                  <div className="p-4 bg-gradient-to-br from-tess-peach/10 to-tess-yellow/10 rounded-2xl">
                    <h3 className="font-bold text-tess-text mb-2">Stay calm when frustrated</h3>
                    <p className="text-sm text-tess-text-light mb-4">Practice breathing and counting when things don't go my way</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-tess-gray rounded-full h-2">
                        <div className="bg-gradient-to-r from-tess-peach to-tess-yellow h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-sm font-bold text-tess-peach">4/7 days</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="card-tess p-6">
                  <h2 className="text-2xl font-bold text-tess-text mb-4 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-tess-pink" />
                    My Toolbox
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-tess-blue/10 to-tess-purple/10 rounded-xl">
                      <span className="text-xl">🫁</span>
                      <div>
                        <h4 className="font-bold text-tess-text">Deep Breathing</h4>
                        <p className="text-xs text-tess-text-light">Used 5 times</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-tess-green/10 to-tess-yellow/10 rounded-xl">
                      <span className="text-xl">🧘</span>
                      <div>
                        <h4 className="font-bold text-tess-text">Mindful Listening</h4>
                        <p className="text-xs text-tess-text-light">Used 3 times</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <Card className="card-tess p-6">
                <h2 className="text-2xl font-bold text-tess-text mb-4">My Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-tess-yellow/20 to-tess-orange/20 rounded-2xl">
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="text-sm font-bold text-tess-text">First Session</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-tess-green/20 to-tess-blue/20 rounded-2xl">
                    <div className="text-3xl mb-2">🔥</div>
                    <p className="text-sm font-bold text-tess-text">7 Day Streak</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-tess-peach/20 to-tess-pink/20 rounded-2xl">
                    <div className="text-3xl mb-2">⭐</div>
                    <p className="text-sm font-bold text-tess-text">Skill Master</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-tess-purple/20 to-tess-blue/20 rounded-2xl">
                    <div className="text-3xl mb-2">🎮</div>
                    <p className="text-sm font-bold text-tess-text">Game Champion</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )
      default:
        return <HomeScreen onStartSession={handleStartSession} />
    }
  }

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
      <div className="h-screen flex bg-tess-bg">
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