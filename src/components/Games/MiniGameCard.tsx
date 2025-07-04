import React from 'react'
import { motion } from 'framer-motion'
import { MiniGame } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MiniGameCardProps {
  game: MiniGame
  onPlay: (game: MiniGame) => void
  className?: string
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
}

const typeIcons = {
  matching: '🧩',
  scenario: '🎭',
  quiz: '🧠'
}

export const MiniGameCard: React.FC<MiniGameCardProps> = ({
  game,
  onPlay,
  className
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{typeIcons[game.type]}</div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {game.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    difficultyColors[game.difficulty]
                  )}>
                    {game.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {Math.floor(game.duration / 60)} min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">{game.description}</p>

          <Button
            onClick={() => onPlay(game)}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Play Game
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}