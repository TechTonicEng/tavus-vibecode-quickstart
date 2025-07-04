import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAtom } from 'jotai'
import { MoodPicker } from '@/components/MoodPicker/MoodPicker'
import { ContextTagSelector } from '@/components/ContextTags/ContextTagSelector'
import { SkillCard } from '@/components/SELSkills/SkillCard'
import { GoalTracker } from '@/components/Goals/GoalTracker'
import { FavoriteSkillsToolbox } from '@/components/Skills/FavoriteSkillsToolbox'
import { MiniGameCard } from '@/components/Games/MiniGameCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  selectedMoodAtom, 
  selectedSkillAtom, 
  selectedContextTagAtom,
  currentGoalAtom,
  studentGoalAtom,
  favoriteSkillsAtom
} from '@/store/session'
import { currentStudentAtom } from '@/store/auth'
import { selSkills } from '@/data/selSkills'
import { selGoals } from '@/data/selGoals'
import { miniGames } from '@/data/miniGames'
import { MoodOption, SELSkill, Student, ContextTag, SELGoal, StudentGoal, FavoriteSkill, MiniGame } from '@/types'
import { Sparkles, Heart, Sun, Target, Gamepad2 } from 'lucide-react'

interface HomeScreenProps {
  onStartSession: () => void
}

// Hardcoded fallback student for testing
const FALLBACK_STUDENT: Student = {
  id: 'hardcoded_student_123',
  name: 'Test Student',
  grade: 4,
  class_id: 'test-class',
  created_at: new Date().toISOString()
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartSession }) => {
  const [selectedMood, setSelectedMood] = useAtom(selectedMoodAtom)
  const [selectedSkill, setSelectedSkill] = useAtom(selectedSkillAtom)
  const [selectedContextTag, setSelectedContextTag] = useAtom(selectedContextTagAtom)
  const [currentStudent, setCurrentStudent] = useAtom(currentStudentAtom)
  const [currentGoal, setCurrentGoal] = useAtom(currentGoalAtom)
  const [studentGoal, setStudentGoal] = useAtom(studentGoalAtom)
  const [favoriteSkills, setFavoriteSkills] = useAtom(favoriteSkillsAtom)
  const [step, setStep] = useState<'greeting' | 'mood' | 'context' | 'skill' | 'ready'>('greeting')
  const [showGoalSelector, setShowGoalSelector] = useState(false)
  const [showMiniGames, setShowMiniGames] = useState(false)

  // Use fallback student if currentStudent is null
  const effectiveStudent = currentStudent || FALLBACK_STUDENT

  // Mock data for demonstration
  const mockStudentGoal: StudentGoal = {
    id: 'goal-1',
    student_id: effectiveStudent.id,
    goal_id: 'stay-calm-frustrated',
    week_start: new Date().toISOString(),
    progress: [true, false, true, false, false, false, false],
    completed: false,
    created_at: new Date().toISOString()
  }

  const mockFavoriteSkills = selSkills.slice(0, 2) // Mock favorite skills

  useEffect(() => {
    console.log('HomeScreen: Component mounted/updated')
    console.log('HomeScreen: selectedMood:', selectedMood)
    console.log('HomeScreen: selectedSkill:', selectedSkill)
    console.log('HomeScreen: selectedContextTag:', selectedContextTag)
    console.log('HomeScreen: currentStudent from atom:', currentStudent)
    console.log('HomeScreen: effectiveStudent (with fallback):', effectiveStudent)
    console.log('HomeScreen: step:', step)
  }, [selectedMood, selectedSkill, selectedContextTag, currentStudent, effectiveStudent, step])

  useEffect(() => {
    console.log('HomeScreen: currentStudent atom value changed:', currentStudent)
    if (currentStudent) {
      console.log('HomeScreen: currentStudent details:', {
        id: currentStudent.id,
        name: currentStudent.name,
        grade: currentStudent.grade,
        class_id: currentStudent.class_id
      })
    } else {
      console.log('HomeScreen: currentStudent is null/undefined - using fallback student')
      setCurrentStudent(FALLBACK_STUDENT)
    }
  }, [currentStudent, setCurrentStudent])

  // Auto-proceed to mood selection when we have a student (real or fallback)
  useEffect(() => {
    if (effectiveStudent && step === 'greeting') {
      console.log('HomeScreen: Student available (real or fallback), moving to mood selection')
      setStep('mood')
    }
  }, [effectiveStudent, step])

  // Initialize mock data
  useEffect(() => {
    if (!currentGoal) {
      setCurrentGoal(selGoals[0])
    }
    if (!studentGoal) {
      setStudentGoal(mockStudentGoal)
    }
    if (favoriteSkills.length === 0) {
      setFavoriteSkills(mockFavoriteSkills.map((skill, index) => ({
        id: `fav-${index}`,
        student_id: effectiveStudent.id,
        skill_id: skill.id,
        created_at: new Date().toISOString()
      })))
    }
  }, [currentGoal, studentGoal, favoriteSkills, setCurrentGoal, setStudentGoal, setFavoriteSkills, effectiveStudent.id])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const handleMoodSelect = (mood: MoodOption) => {
    console.log('HomeScreen: Mood selected:', mood)
    setSelectedMood(mood)
    
    setTimeout(() => {
      console.log('HomeScreen: Auto-advancing to context selection')
      setStep('context')
    }, 500)
  }

  const handleContextSelect = (tag: ContextTag | null) => {
    console.log('HomeScreen: Context selected:', tag)
    setSelectedContextTag(tag)
    
    setTimeout(() => {
      console.log('HomeScreen: Auto-advancing to skill selection')
      setStep('skill')
    }, 500)
  }

  const handleSkillSelect = (skill: SELSkill) => {
    console.log('HomeScreen: Skill selected:', skill)
    setSelectedSkill(skill)
    
    setTimeout(() => {
      console.log('HomeScreen: Auto-advancing to ready state')
      setStep('ready')
    }, 500)
  }

  const handleGoalCheckIn = () => {
    if (studentGoal) {
      const currentDay = new Date().getDay() - 1
      const newProgress = [...studentGoal.progress]
      newProgress[currentDay] = true
      
      setStudentGoal({
        ...studentGoal,
        progress: newProgress
      })
    }
  }

  const handleFavoriteSkillSelect = (skill: SELSkill) => {
    setSelectedSkill(skill)
    setStep('ready')
  }

  const handleMiniGamePlay = (game: MiniGame) => {
    console.log('Playing mini game:', game.title)
    // This would open the mini game component
  }

  const canStartSession = selectedMood && selectedSkill

  const handleStartSession = () => {
    console.log('HomeScreen: handleStartSession called')
    console.log('HomeScreen: Current state before starting session:', {
      selectedMood,
      selectedSkill,
      selectedContextTag,
      canStartSession
    })

    if (!selectedMood || !selectedSkill) {
      console.error('HomeScreen: Cannot start session: missing mood or skill')
      return
    }
    
    console.log('HomeScreen: Mood and skill present, calling onStartSession')
    onStartSession()
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-4xl">
            <Sun className="w-10 h-10 text-yellow-500" />
            <span>☁️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            {getGreeting()}, {effectiveStudent?.name || 'Friend'}!
          </h1>
          <p className="text-lg text-gray-600 text-center">
            I'm Tess, and I'm here to help you with your feelings today.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Flow */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
              {['mood', 'context', 'skill', 'ready'].map((stepName, index) => (
                <div key={stepName} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName || 
                    (step === 'ready' && index < 3) || 
                    (step === 'skill' && index < 2) ||
                    (step === 'context' && index === 0)
                      ? 'bg-primary text-white'
                      : selectedMood && index === 0
                      ? 'bg-green-500 text-white'
                      : selectedContextTag !== undefined && index === 1
                      ? 'bg-green-500 text-white'
                      : selectedSkill && index === 2
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {selectedMood && index === 0 ? '✓' : 
                     selectedContextTag !== undefined && index === 1 ? '✓' :
                     selectedSkill && index === 2 ? '✓' :
                     index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`w-8 h-1 rounded ${
                      (step === 'context' && index === 0) || 
                      (step === 'skill' && index < 2) || 
                      (step === 'ready' && index < 3)
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(step === 'greeting' || step === 'mood') && (
                <MoodPicker
                  selectedMood={selectedMood}
                  onMoodSelect={handleMoodSelect}
                />
              )}

              {step === 'context' && (
                <ContextTagSelector
                  selectedTag={selectedContextTag}
                  onTagSelect={handleContextSelect}
                />
              )}

              {step === 'skill' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Let's learn a helpful skill!
                    </h2>
                    <p className="text-gray-600">
                      Choose a skill that might help you feel better
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selSkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        onSelect={handleSkillSelect}
                        isSelected={selectedSkill?.id === skill.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 'ready' && canStartSession && (
                <Card className="max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                      <Sparkles className="w-6 h-6 text-primary" />
                      Ready to chat with Tess!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                          <span className="text-2xl">{selectedMood.emoji}</span>
                          <span className="font-medium text-primary">{selectedMood.label}</span>
                        </div>
                        {selectedContextTag && (
                          <>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                              <span className="text-lg">{selectedContextTag.emoji}</span>
                              <span className="font-medium text-gray-700">{selectedContextTag.label}</span>
                            </div>
                          </>
                        )}
                        <Heart className="w-5 h-5 text-red-500" />
                        <div className="px-4 py-2 bg-secondary/10 rounded-full">
                          <span className="font-medium text-secondary">{selectedSkill.title}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600">
                        Tess will help you practice {selectedSkill.title.toLowerCase()} while you talk about feeling {selectedMood.label.toLowerCase()}.
                      </p>
                    </div>

                    <Button
                      onClick={handleStartSession}
                      size="lg"
                      className="w-full"
                      disabled={!canStartSession}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start My Session with Tess
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Navigation */}
            {step !== 'greeting' && step !== 'ready' && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === 'skill') setStep('context')
                    if (step === 'context') setStep('mood')
                    if (step === 'mood') setStep('greeting')
                  }}
                >
                  Back
                </Button>
                
                {step === 'mood' && selectedMood && (
                  <Button onClick={() => setStep('context')}>
                    Next: Add Context
                  </Button>
                )}
                
                {step === 'context' && (
                  <Button onClick={() => setStep('skill')}>
                    Next: Choose a Skill
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Additional Features */}
          <div className="space-y-6">
            {/* Goal Tracker */}
            {currentGoal && studentGoal && (
              <GoalTracker
                goal={currentGoal}
                studentGoal={studentGoal}
                onCheckIn={handleGoalCheckIn}
                canCheckIn={true}
              />
            )}

            {/* Favorite Skills Toolbox */}
            <FavoriteSkillsToolbox
              favoriteSkills={mockFavoriteSkills}
              onSkillSelect={handleFavoriteSkillSelect}
            />

            {/* Mini Games */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  SEL Games
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {miniGames.slice(0, 2).map((game) => (
                  <div key={game.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{game.title}</h4>
                        <p className="text-sm text-gray-600">{game.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleMiniGamePlay(game)}
                      >
                        Play
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowMiniGames(true)}
                >
                  View All Games
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-left">
            <p><strong>Debug Info:</strong></p>
            <p>Current Student: {currentStudent ? `${currentStudent.name} (ID: ${currentStudent.id})` : 'null'}</p>
            <p>Effective Student: {effectiveStudent ? `${effectiveStudent.name} (ID: ${effectiveStudent.id})` : 'null'}</p>
            <p>Using Fallback: {!currentStudent && effectiveStudent ? 'Yes' : 'No'}</p>
            <p>Selected Mood: {selectedMood ? `${selectedMood.label} (${selectedMood.value})` : 'none'}</p>
            <p>Selected Context: {selectedContextTag ? `${selectedContextTag.label} (${selectedContextTag.id})` : selectedContextTag === null ? 'skipped' : 'none'}</p>
            <p>Selected Skill: {selectedSkill ? `${selectedSkill.title} (${selectedSkill.id})` : 'none'}</p>
            <p>Can Start Session: {canStartSession ? 'Yes' : 'No'}</p>
            <p>Current Step: {step}</p>
          </div>
        )}
      </div>
    </div>
  )
}