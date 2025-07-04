import React from 'react'
import { motion } from 'framer-motion'
import { selGoals } from '@/data/selGoals'
import { SELGoal } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GoalSelectorProps {
  selectedGoal: SELGoal | null
  onGoalSelect: (goal: SELGoal) => void
  className?: string
}

const categoryColors = {
  'emotional-regulation': 'bg-blue-100 text-blue-800',
  'social-skills': 'bg-green-100 text-green-800',
  'self-awareness': 'bg-purple-100 text-purple-800',
  'responsible-decision-making': 'bg-orange-100 text-orange-800'
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({
  selectedGoal,
  onGoalSelect,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            Choose Your Weekly Goal
          </h2>
        </div>
        <p className="text-gray-600">
          Pick something you'd like to work on this week
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selGoals.map((goal) => (
          <motion.div
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className={cn(
              "cursor-pointer transition-all duration-200 h-full",
              selectedGoal?.id === goal.id && "ring-2 ring-primary shadow-lg"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{goal.icon}</div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {goal.title}
                      </CardTitle>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block",
                        categoryColors[goal.category]
                      )}>
                        {goal.category.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  {selectedGoal?.id === goal.id && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{goal.description}</p>

                <Button
                  onClick={() => onGoalSelect(goal)}
                  className="w-full"
                  variant={selectedGoal?.id === goal.id ? "default" : "outline"}
                >
                  {selectedGoal?.id === goal.id ? "Selected!" : "Choose This Goal"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}