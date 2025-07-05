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
import { Sparkles, Heart, Sun, Target, Gamepad2, ArrowRight, CheckCircle } from 'lucide-react'

interface HomeScreenProps {
  onStartSession: () => void
}

// Hardcoded fallback student for testing
const FALLBACK_STUDENT: Student = {
  id: '550e8400-e29b-41d4-a716-446655440000',
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
    if (effectiveStudent && step === 'greeting') {
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
    setSelectedMood(mood)
    setTimeout(() => {
      setStep('context')
    }, 500)
  }

  const handleContextSelect = (tag: ContextTag | null) => {
    setSelectedContextTag(tag)
    setTimeout(() => {
      setStep('skill')
    }, 500)
  }

  const handleSkillSelect = (skill: SELSkill) => {
    setSelectedSkill(skill)
    setTimeout(() => {
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
  }

  const canStartSession = selectedMood && selectedSkill

  const handleStartSession = () => {
    if (!selectedMood || !selectedSkill) {
      return
    }
    onStartSession()
  }

  const getStepNumber = (stepName: string) => {
    const steps = ['mood', 'context', 'skill', 'ready']
    return steps.indexOf(stepName) + 1
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-warm">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 text-5xl mb-4">
            <Sun className="w-12 h-12 text-tess-yellow animate-float" />
            <span>☁️</span>
          </div>
          <h1 className="text-4xl font-bold text-tess-text">
            {getGreeting()}, {effectiveStudent?.name || 'Friend'}!
          </h1>
          <p className="text-xl text-tess-text-light">
            I'm Tess, and I'm here to help you with your feelings today.
          </p>
        </motion.div>

        {/* Progress Steps */}
        {step !== 'greeting' && (
          <div className="flex items-center justify-center gap-4 mb-8">
            {['mood', 'context', 'skill', 'ready'].map((stepName, index) => (
              <div key={stepName} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step === stepName
                    ? 'bg-tess-peach text-tess-text shadow-lg scale-110'
                    : selectedMood && index === 0
                    ? 'bg-tess-green text-tess-text'
                    : selectedContextTag !== undefined && index === 1
                    ? 'bg-tess-green text-tess-text'
                    : selectedSkill && index === 2
                    ? 'bg-tess-green text-tess-text'
                    : canStartSession && index === 3
                    ? 'bg-tess-green text-tess-text'
                    : 'bg-tess-gray text-tess-text-light'
                }`}>
                  {selectedMood && index === 0 ? <CheckCircle className="w-5 h-5" /> : 
                   selectedContextTag !== undefined && index === 1 ? <CheckCircle className="w-5 h-5" /> :
                   selectedSkill && index === 2 ? <CheckCircle className="w-5 h-5" /> :
                   canStartSession && index === 3 ? <CheckCircle className="w-5 h-5" /> :
                   index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 rounded transition-all duration-300 ${
                    (step === 'context' && index === 0) || 
                    (step === 'skill' && index < 2) || 
                    (step === 'ready' && index < 3)
                      ? 'bg-tess-peach'
                      : 'bg-tess-gray'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(step === 'greeting' || step === 'mood') && (
                <div className="card-tess p-8">
                  <MoodPicker
                    selectedMood={selectedMood}
                    onMoodSelect={handleMoodSelect}
                  />
                </div>
              )}

              {step === 'context' && (
                <div className="card-tess p-8">
                  <ContextTagSelector
                    selectedTag={selectedContextTag}
                    onTagSelect={handleContextSelect}
                  />
                </div>
              )}

              {step === 'skill' && (
                <div className="card-tess p-8 space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-tess-text mb-2">
                      Let's learn a helpful skill!
                    </h2>
                    <p className="text-lg text-tess-text-light">
                      Choose a skill that might help you feel better
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="card-tess p-8 max-w-3xl mx-auto">
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-tess-peach animate-float" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-tess-text">
                      Ready to chat with Tess!
                    </h2>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 px-4 py-2 bg-tess-peach/20 rounded-full">
                        <span className="text-2xl">{selectedMood.emoji}</span>
                        <span className="font-semibold text-tess-text">{selectedMood.label}</span>
                      </div>
                      {selectedContextTag && (
                        <>
                          <ArrowRight className="w-4 h-4 text-tess-text-light" />
                          <div className="flex items-center gap-2 px-4 py-2 bg-tess-blue/20 rounded-full">
                            <span className="text-lg">{selectedContextTag.emoji}</span>
                            <span className="font-medium text-tess-text">{selectedContextTag.label}</span>
                          </div>
                        </>
                      )}
                      <ArrowRight className="w-4 h-4 text-tess-text-light" />
                      <div className="px-4 py-2 bg-tess-green/20 rounded-full">
                        <span className="font-semibold text-tess-text">{selectedSkill.title}</span>
                      </div>
                    </div>
                    
                    <p className="text-lg text-tess-text-light max-w-2xl mx-auto">
                      Tess will help you practice {selectedSkill.title.toLowerCase()} while you talk about feeling {selectedMood.label.toLowerCase()}.
                    </p>

                    <Button
                      onClick={handleStartSession}
                      size="lg"
                      className="btn-tess text-lg px-8 py-4"
                      disabled={!canStartSession}
                    >
                      <Sparkles className="w-6 h-6 mr-3" />
                      Start My Session with Tess
                    </Button>
                  </div>
                </div>
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
                  className="bg-white border-tess-gray text-tess-text hover:bg-tess-gray"
                >
                  Back
                </Button>
                
                {step === 'mood' && selectedMood && (
                  <Button 
                    onClick={() => setStep('context')}
                    className="btn-tess"
                  >
                    Next: Add Context
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                
                {step === 'context' && (
                  <Button 
                    onClick={() => setStep('skill')}
                    className="btn-tess"
                  >
                    Next: Choose a Skill
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
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
            <Card className="card-tess">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tess-text">
                  <Gamepad2 className="w-5 h-5 text-tess-peach" />
                  SEL Games
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {miniGames.slice(0, 2).map((game) => (
                  <div key={game.id} className="p-3 bg-tess-gray rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-tess-text">{game.title}</h4>
                        <p className="text-sm text-tess-text-light">{game.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleMiniGamePlay(game)}
                        className="btn-tess-secondary"
                      >
                        Play
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full bg-white border-tess-gray text-tess-text hover:bg-tess-gray"
                  onClick={() => setShowMiniGames(true)}
                >
                  View All Games
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}