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
                {/* Skills will be rendered using SkillCard component */}
                {[
                  { id: 'deep-breathing', title: 'Deep Breathing', description: 'Learn to calm down with special breathing techniques', category: 'breathing', duration: 120, instructions: [] },
                  { id: 'mindful-listening', title: 'Mindful Listening', description: 'Listen carefully to sounds around you', category: 'mindfulness', duration: 180, instructions: [] },
                  { id: 'positive-self-talk', title: 'Positive Self-Talk', description: 'Say kind things to yourself', category: 'reframing', duration: 150, instructions: [] },
                  { id: 'gratitude-practice', title: 'Gratitude Practice', description: 'Think about good things in your life', category: 'mindfulness', duration: 120, instructions: [] },
                  { id: 'making-friends', title: 'Making Friends', description: 'Learn how to be a good friend', category: 'social', duration: 200, instructions: [] },
                  { id: 'belly-breathing', title: 'Belly Breathing', description: 'Use your belly to breathe like a balloon', category: 'breathing', duration: 90, instructions: [] }
                ].map((skill) => (
                  <div key={skill.id}>
                    <Card className="card-tess p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-tess-blue to-tess-purple rounded-full flex items-center justify-center">
                            <span className="text-xl">
                              {skill.category === 'breathing' ? '🫁' : 
                               skill.category === 'mindfulness' ? '🧘' : 
                               skill.category === 'reframing' ? '💭' : '🤝'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-tess-text">{skill.title}</h3>
                            <span className="text-xs bg-tess-blue/20 text-tess-blue px-2 py-1 rounded-full">{skill.category}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 h-8 w-8"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-tess-text-light mb-4">{skill.description}</p>
                      <Button className="w-full bg-gradient-to-r from-tess-blue to-tess-purple text-white">
                        <span className="text-xl mr-2">▶</span>
                        Practice Now
                      </Button>
                    </Card>
                  </div>
                ))}
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
                  <Button 
                    className="w-full bg-gradient-to-r from-tess-peach to-tess-yellow text-white"
                    onClick={() => setCurrentView('match-game')}
                  >
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
      case 'match-game':
        return <MatchingGameView onExit={() => setCurrentView('games')} />
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

// Matching Game Component
const MatchingGameView: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameItems, setGameItems] = useState<Array<{
    id: string
    content: string
    type: 'emotion' | 'situation'
    matched: boolean
    pairId: number
  }>>([])
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes

  const gamePairs = [
    { emotion: '😊', situation: 'Getting a good grade on a test' },
    { emotion: '😢', situation: 'Losing your favorite toy' },
    { emotion: '😠', situation: 'Someone cuts in line' },
    { emotion: '😰', situation: 'Speaking in front of the class' },
    { emotion: '😴', situation: 'Staying up too late' },
    { emotion: '🤗', situation: 'Hugging a friend' }
  ]

  useEffect(() => {
    // Initialize game items
    const items: Array<{
      id: string
      content: string
      type: 'emotion' | 'situation'
      matched: boolean
      pairId: number
    }> = []
    
    gamePairs.forEach((pair, index) => {
      items.push({
        id: `emotion-${index}`,
        content: pair.emotion,
        type: 'emotion',
        matched: false,
        pairId: index
      })
      items.push({
        id: `situation-${index}`,
        content: pair.situation,
        type: 'situation',
        matched: false,
        pairId: index
      })
    })
    
    // Shuffle situations
    const emotions = items.filter(item => item.type === 'emotion')
    const situations = items.filter(item => item.type === 'situation')
    const shuffledSituations = [...situations].sort(() => Math.random() - 0.5)
    
    setGameItems([...emotions, ...shuffledSituations])
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleGameEnd()
    }
  }, [timeLeft, gameCompleted])

  const handleItemClick = (item: any) => {
    if (item.matched) return

    if (item.type === 'emotion') {
      setSelectedEmotion(item.id)
    } else if (item.type === 'situation' && selectedEmotion) {
      checkMatch(selectedEmotion, item.id)
    }
  }

  const checkMatch = (emotionId: string, situationId: string) => {
    const emotionItem = gameItems.find(item => item.id === emotionId)
    const situationItem = gameItems.find(item => item.id === situationId)
    
    setAttempts(prev => prev + 1)

    if (emotionItem && situationItem && emotionItem.pairId === situationItem.pairId) {
      // Correct match
      setGameItems(prev => prev.map(item => 
        item.id === emotionId || item.id === situationId
          ? { ...item, matched: true }
          : item
      ))
      setScore(prev => prev + 10)
      setSelectedEmotion(null)

      // Check if game is completed
      const newMatchedCount = gameItems.filter(item => item.matched).length + 2
      if (newMatchedCount === gameItems.length) {
        setTimeout(() => handleGameEnd(), 500)
      }
    } else {
      // Incorrect match
      setSelectedEmotion(null)
    }
  }

  const handleGameEnd = () => {
    setGameCompleted(true)
  }

  const resetGame = () => {
    setScore(0)
    setAttempts(0)
    setGameCompleted(false)
    setTimeLeft(120)
    setSelectedEmotion(null)
    setGameItems(prev => prev.map(item => ({ ...item, matched: false })))
  }

  if (gameCompleted) {
    return (
      <div className="p-6 h-full flex items-center justify-center bg-gradient-to-br from-tess-peach/20 to-tess-yellow/20">
        <Card className="max-w-2xl mx-auto card-tess">
          <CardContent className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="text-6xl">🏆</div>
              <h2 className="text-2xl font-bold text-gray-900">Great Job!</h2>
              <p className="text-lg text-gray-600">
                You scored {score} points in {attempts} attempts!
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={resetGame} className="bg-gradient-to-r from-tess-green to-tess-blue text-white">
                  🔄 Play Again
                </Button>
                <Button variant="outline" onClick={onExit}>
                  🏠 Back to Games
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 h-full bg-gradient-to-br from-tess-peach/20 to-tess-yellow/20">
      <Card className="max-w-6xl mx-auto card-tess">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-tess-text">🧩 Match the Feeling</CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold text-tess-peach">Score: {score}</span>
              <span className="font-bold text-tess-blue">Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600 text-lg">
            Click an emotion, then click the matching situation!
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-center text-xl text-tess-text">Emotions</h3>
              <div className="space-y-3">
                {gameItems.filter(item => item.type === 'emotion').map((item) => (
                  <motion.div
                    key={item.id}
                    className={cn(
                      "p-6 border-3 rounded-2xl cursor-pointer text-center transition-all duration-200",
                      item.matched
                        ? "bg-gradient-to-r from-tess-green to-tess-blue border-tess-green text-white shadow-lg"
                        : selectedEmotion === item.id
                        ? "bg-gradient-to-r from-tess-peach to-tess-yellow border-tess-peach text-white shadow-lg"
                        : "bg-white border-gray-200 hover:border-tess-peach hover:shadow-md"
                    )}
                    onClick={() => handleItemClick(item)}
                    whileHover={{ scale: item.matched ? 1 : 1.02 }}
                    whileTap={{ scale: item.matched ? 1 : 0.98 }}
                  >
                    <div className="text-5xl mb-2">{item.content}</div>
                    {item.matched && <div className="text-sm font-bold">✓ Matched!</div>}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-center text-xl text-tess-text">Situations</h3>
              <div className="space-y-3">
                {gameItems.filter(item => item.type === 'situation').map((item) => (
                  <motion.div
                    key={item.id}
                    className={cn(
                      "p-6 border-3 rounded-2xl cursor-pointer text-center transition-all duration-200",
                      item.matched
                        ? "bg-gradient-to-r from-tess-green to-tess-blue border-tess-green text-white shadow-lg"
                        : selectedEmotion
                        ? "bg-gray-50 border-gray-300 hover:border-tess-peach hover:bg-white"
                        : "bg-gray-100 border-gray-200"
                    )}
                    onClick={() => handleItemClick(item)}
                    whileHover={{ scale: item.matched ? 1 : 1.02 }}
                    whileTap={{ scale: item.matched ? 1 : 0.98 }}
                  >
                    <div className="text-base font-medium">{item.content}</div>
                    {item.matched && <div className="text-sm font-bold mt-2">✓ Matched!</div>}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={onExit} className="bg-white">
              Exit Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App