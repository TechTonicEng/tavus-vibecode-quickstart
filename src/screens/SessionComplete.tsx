import React from 'react'
import { motion } from 'framer-motion'
import { useAtom } from 'jotai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { selectedMoodAtom, selectedSkillAtom } from '@/store/session'
import { Sparkles, Star, Heart, Home } from 'lucide-react'

interface SessionCompleteProps {
  onReturnHome: () => void
}

export const SessionComplete: React.FC<SessionCompleteProps> = ({ onReturnHome }) => {
  const [selectedMood] = useAtom(selectedMoodAtom)
  const [selectedSkill] = useAtom(selectedSkillAtom)

  const encouragementMessages = [
    "You did an amazing job today!",
    "I'm so proud of how you shared your feelings!",
    "You're getting better at understanding your emotions!",
    "Great work practicing that skill!",
    "You're such a brave and thoughtful person!"
  ]

  const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]

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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMood && (
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{selectedMood.emoji}</span>
                      <div>
                        <h4 className="font-semibold text-primary">Your Feeling</h4>
                        <p className="text-sm text-gray-600">{selectedMood.label}</p>
                      </div>
                    </div>
                  </div>
                )}

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

              <Button
                onClick={onReturnHome}
                size="lg"
                className="w-full"
              >
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}