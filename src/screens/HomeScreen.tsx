import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAtom } from 'jotai'
import { MoodPicker } from '@/components/MoodPicker/MoodPicker'
import { SkillCard } from '@/components/SELSkills/SkillCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { selectedMoodAtom, selectedSkillAtom } from '@/store/session'
import { currentStudentAtom } from '@/store/auth'
import { selSkills } from '@/data/selSkills'
import { MoodOption, SELSkill } from '@/types'
import { Sparkles, Heart, Sun } from 'lucide-react'

interface HomeScreenProps {
  onStartSession: () => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartSession }) => {
  const [selectedMood, setSelectedMood] = useAtom(selectedMoodAtom)
  const [selectedSkill, setSelectedSkill] = useAtom(selectedSkillAtom)
  const [currentStudent] = useAtom(currentStudentAtom)
  const [step, setStep] = useState<'greeting' | 'mood' | 'skill' | 'ready'>('greeting')

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood)
    setStep('skill')
  }

  const handleSkillSelect = (skill: SELSkill) => {
    setSelectedSkill(skill)
    setStep('ready')
  }

  const canStartSession = selectedMood && selectedSkill

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-4xl">
            <Sun className="w-10 h-10 text-yellow-500" />
            <span>☁️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {currentStudent?.name || 'Friend'}!
          </h1>
          <p className="text-lg text-gray-600">
            I'm Tess, and I'm here to help you with your feelings today.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {['mood', 'skill', 'ready'].map((stepName, index) => (
            <div key={stepName} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName || (step === 'ready' && index < 2) || (step === 'skill' && index === 0)
                  ? 'bg-primary text-white'
                  : selectedMood && index === 0
                  ? 'bg-green-500 text-white'
                  : selectedSkill && index === 1
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {selectedMood && index === 0 ? '✓' : 
                 selectedSkill && index === 1 ? '✓' :
                 index + 1}
              </div>
              {index < 2 && (
                <div className={`w-8 h-1 rounded ${
                  (step === 'skill' && index === 0) || (step === 'ready' && index < 2)
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <span className="text-2xl">{selectedMood.emoji}</span>
                      <span className="font-medium text-primary">{selectedMood.label}</span>
                    </div>
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
                  onClick={onStartSession}
                  size="lg"
                  className="w-full"
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
                if (step === 'skill') setStep('mood')
                if (step === 'mood') setStep('greeting')
              }}
            >
              Back
            </Button>
            
            {step === 'mood' && selectedMood && (
              <Button onClick={() => setStep('skill')}>
                Next: Choose a Skill
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}