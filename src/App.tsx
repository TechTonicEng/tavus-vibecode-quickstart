import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { DailyProvider } from '@daily-co/daily-react'
import { Sidebar } from '@/components/Layout/Sidebar'
import { HomeScreen } from '@/screens/HomeScreen'
import { SessionView } from '@/components/Session/SessionView'
import { SessionComplete } from '@/screens/SessionComplete'
import { currentStudentAtom, isAuthenticatedAtom } from '@/store/auth'
import { conversationAtom } from '@/store/conversation'
import { selectedMoodAtom, selectedSkillAtom, currentSessionAtom } from '@/store/session'
import { createConversation } from '@/api/conversation'
import { createSession } from '@/api/sessions'
import { supabase } from '@/lib/supabase'

type AppView = 'home' | 'session' | 'complete' | 'sessions' | 'skills' | 'settings' | 'profile'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom)
  const [currentStudent, setCurrentStudent] = useAtom(currentStudentAtom)
  const [conversation, setConversation] = useAtom(conversationAtom)
  const [selectedMood] = useAtom(selectedMoodAtom)
  const [selectedSkill] = useAtom(selectedSkillAtom)
  const [currentSession, setCurrentSession] = useAtom(currentSessionAtom)

  // Mock authentication - in real app this would be handled by Clever/ClassLink
  useEffect(() => {
    const initializeMockStudent = async () => {
      try {
        const mockStudentId = '550e8400-e29b-41d4-a716-446655440000'
        
        // Check if student already exists
        const { data: existingStudent, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('id', mockStudentId)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected if student doesn't exist
          console.error('Error checking for existing student:', fetchError)
          return
        }

        let student = existingStudent

        if (!student) {
          // Student doesn't exist, create them
          const mockStudentData = {
            id: mockStudentId,
            name: 'Alex',
            grade: 3,
            class_id: 'class-456'
          }

          const { data: newStudent, error: insertError } = await supabase
            .from('students')
            .insert(mockStudentData)
            .select()
            .single()

          if (insertError) {
            console.error('Error creating mock student:', insertError)
            return
          }

          student = newStudent
        }

        setCurrentStudent(student)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to initialize mock student:', error)
      }
    }

    initializeMockStudent()
  }, [setCurrentStudent, setIsAuthenticated])

  const handleStartSession = async () => {
    if (!selectedMood || !selectedSkill || !currentStudent) {
      console.error('Missing required data for session')
      return
    }

    try {
      console.log('Starting session with:', { selectedMood, selectedSkill, currentStudent })

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
      // Handle error - show user-friendly message
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

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DailyProvider>
      <div className="h-screen flex bg-gray-50">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </DailyProvider>
  )
}

export default App