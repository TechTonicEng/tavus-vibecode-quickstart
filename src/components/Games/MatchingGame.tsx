import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MiniGame } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, RotateCcw, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatchingGameProps {
  game: MiniGame
  onComplete: (score: number) => void
  onExit: () => void
}

interface GameItem {
  id: string
  content: string
  type: 'emotion' | 'situation'
  matched: boolean
}

export const MatchingGame: React.FC<MatchingGameProps> = ({
  game,
  onComplete,
  onExit
}) => {
  const [gameItems, setGameItems] = useState<GameItem[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(game.duration)

  useEffect(() => {
    // Initialize game items
    const items: GameItem[] = []
    game.content.pairs.forEach((pair: any, index: number) => {
      items.push({
        id: `emotion-${index}`,
        content: pair.emotion,
        type: 'emotion',
        matched: false
      })
      items.push({
        id: `situation-${index}`,
        content: pair.situation,
        type: 'situation',
        matched: false
      })
    })
    
    // Shuffle situations
    const emotions = items.filter(item => item.type === 'emotion')
    const situations = items.filter(item => item.type === 'situation')
    const shuffledSituations = [...situations].sort(() => Math.random() - 0.5)
    
    setGameItems([...emotions, ...shuffledSituations])
  }, [game])

  useEffect(() => {
    if (timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleGameEnd()
    }
  }, [timeLeft, gameCompleted])

  const handleItemClick = (item: GameItem) => {
    if (item.matched) return

    if (item.type === 'emotion') {
      setSelectedEmotion(item.id)
    } else if (item.type === 'situation' && selectedEmotion) {
      checkMatch(selectedEmotion, item.id)
    }
  }

  const checkMatch = (emotionId: string, situationId: string) => {
    const emotionIndex = parseInt(emotionId.split('-')[1])
    const situationIndex = parseInt(situationId.split('-')[1])
    
    setAttempts(prev => prev + 1)

    if (emotionIndex === situationIndex) {
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
      // Brief visual feedback could be added here
    }
  }

  const handleGameEnd = () => {
    setGameCompleted(true)
    const finalScore = Math.max(0, score - (attempts - score/10) * 2)
    onComplete(finalScore)
  }

  const resetGame = () => {
    setScore(0)
    setAttempts(0)
    setGameCompleted(false)
    setTimeLeft(game.duration)
    setSelectedEmotion(null)
    setGameItems(prev => prev.map(item => ({ ...item, matched: false })))
  }

  if (gameCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="space-y-4"
          >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Great Job!</h2>
            <p className="text-lg text-gray-600">
              You scored {score} points in {attempts} attempts!
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button variant="outline" onClick={onExit}>
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{game.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span>Score: {score}</span>
            <span>Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-center text-gray-600">
          Click an emotion, then click the matching situation!
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-center">Emotions</h3>
            <div className="space-y-2">
              {gameItems.filter(item => item.type === 'emotion').map((item) => (
                <motion.div
                  key={item.id}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer text-center transition-all duration-200",
                    item.matched
                      ? "bg-green-100 border-green-500 text-green-800"
                      : selectedEmotion === item.id
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => handleItemClick(item)}
                  whileHover={{ scale: item.matched ? 1 : 1.02 }}
                  whileTap={{ scale: item.matched ? 1 : 0.98 }}
                >
                  <div className="text-3xl mb-2">{item.content}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-center">Situations</h3>
            <div className="space-y-2">
              {gameItems.filter(item => item.type === 'situation').map((item) => (
                <motion.div
                  key={item.id}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer text-center transition-all duration-200",
                    item.matched
                      ? "bg-green-100 border-green-500 text-green-800"
                      : selectedEmotion
                      ? "bg-gray-50 border-gray-300 hover:border-primary"
                      : "bg-gray-100 border-gray-200"
                  )}
                  onClick={() => handleItemClick(item)}
                  whileHover={{ scale: item.matched ? 1 : 1.02 }}
                  whileTap={{ scale: item.matched ? 1 : 0.98 }}
                >
                  <div className="text-sm">{item.content}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={onExit}>
            Exit Game
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}