import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAtom } from 'jotai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JournalPrompt } from '@/components/Journal/JournalPrompt'
import { MiniGameCard } from '@/components/Games/MiniGameCard'
import { selectedMoodAtom, selectedSkillAtom, selectedContextTagAtom } from '@/store/session'
import { miniGames } from '@/data/miniGames'
import { Sparkles, Star, Heart, Home, BookOpen, Gamepad2 } from 'lucide-react'

interface SessionCompleteProps {
  onReturnHome: () => void
}

const journalPrompts = [
  "What happened today that made you feel this way?",
  "How did the breathing exercise help you?",
  "What would you tell a friend who was feeling the same way?",
  "What could you do differently next time?",
  "What are you grateful for today?"
]

export const SessionComplete: React.FC<SessionCompleteProps> = ({ onReturnHome }) => {
  const [selectedMood] = useAtom(selectedMoodAtom)
  const [selectedSkill] = useAtom(selectedSkillAtom)
  const [selectedContextTag] = useAtom(selectedContextTagAtom)
  const [showJournal, setShowJournal] = useState(false)
  const [showGames, setShowGames] = useState(false)
  const [journalCompleted, setJournalCompleted] = useState(false)

  const encouragementMessages = [
    "You did an amazing job today!",
    "I'm so proud of how you shared your feelings!",
    "You're getting better at understanding your emotions!",
    "Great work practicing that skill!",
    "You're such a brave and thoughtful person!"
  ]

  const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
  const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)]

  const handleJournalSubmit = (response: string) => {
    console.log('Journal entry:', response)
    // Here you would save the journal entry to the database
    setJournalCompleted(true)
    setShowJournal(false)
  }

  const handleJournalSkip = () => {
    setShowJournal(false)
  }

  const handleGamePlay = (game: any) => {
    console.log('Playing game:', game.title)
    // This would open the selected mini game
  }

  if (showJournal) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-2xl w-full">
          <JournalPrompt
            prompt={randomPrompt}
            onSubmit={handleJournalSubmit}
            onSkip={handleJournalSkip}
          />
        </div>
      </div>
    )
  }

  if (showGames) {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 to-green-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">SEL Mini Games</h2>
            <p className="text-gray-600">Practice your social-emotional skills with fun activities!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniGames.map((game) => (
              <MiniGameCard
                key={game.id}
                game={game}
                onPlay={handleGamePlay}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" onClick={() => setShowGames(false)}>
              Back to Summary
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="text-center overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white pb-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <Sparkles className="w-16 h-16" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <Star className="w-6 h-6 text-yellow-300" />
                  </motion.div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">
                Session Complete!
              </CardTitle>
              <p className="text-lg opacity-90">
                {randomMessage}
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                What we did today:
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{selectedMood?.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-primary">Your Feeling</h4>
                      <p className="text-sm text-gray-600">{selectedMood?.label}</p>
                      {selectedContextTag && (
                        <p className="text-xs text-gray-500">
                          {selectedContextTag.emoji} {selectedContextTag.label}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedSkill && (
                  <div className="p-4 bg-secondary/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-8 h-8 text-secondary" />
                      <div>
                        <h4 className="font-semibold text-secondary">Skill Practiced</h4>
                        <p className="text-sm text-gray-600">{selectedSkill.title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  🌟 You earned a sticker!
                </h4>
                <p className="text-gray-600 text-sm">
                  Keep practicing these skills, and remember - it's always okay to feel your feelings!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={() => setShowJournal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  {journalCompleted ? 'Journal ✓' : 'Write in Journal'}
                </Button>
                
                <Button
                  onClick={() => setShowGames(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Play Games
                </Button>
                
                <Button
                  onClick={onReturnHome}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}