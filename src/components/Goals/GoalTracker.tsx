import React from 'react'
import { motion } from 'framer-motion'
import { SELGoal, StudentGoal } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, CheckCircle, Circle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GoalTrackerProps {
  goal: SELGoal
  studentGoal: StudentGoal
  onCheckIn: () => void
  canCheckIn: boolean
  className?: string
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  goal,
  studentGoal,
  onCheckIn,
  canCheckIn,
  className
}) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const currentDay = new Date().getDay() - 1 // Convert to 0-6 (Mon-Sun)
  const streak = studentGoal.progress.filter(Boolean).length

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          My Weekly Goal
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
          <div className="text-2xl">{goal.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{goal.title}</h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progress this week</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{streak}/7 days</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{day}</div>
                <motion.div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2",
                    studentGoal.progress[index]
                      ? "bg-green-500 border-green-500 text-white"
                      : index === currentDay
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-gray-50"
                  )}
                  whileHover={{ scale: 1.1 }}
                >
                  {studentGoal.progress[index] ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {canCheckIn && (
          <Button
            onClick={onCheckIn}
            className="w-full"
            disabled={studentGoal.progress[currentDay]}
          >
            {studentGoal.progress[currentDay] 
              ? "✓ Checked in today!" 
              : "Check in for today"
            }
          </Button>
        )}

        {streak >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center"
          >
            <div className="text-2xl mb-1">🎉</div>
            <p className="text-sm font-medium text-yellow-800">
              Amazing! You're on a {streak}-day streak!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}