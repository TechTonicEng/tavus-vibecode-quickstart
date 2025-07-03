import React from 'react'
import { motion } from 'framer-motion'
import { SELSkill } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SkillCardProps {
  skill: SELSkill
  onSelect: (skill: SELSkill) => void
  isSelected?: boolean
}

const categoryColors = {
  breathing: 'bg-blue-100 text-blue-800',
  mindfulness: 'bg-green-100 text-green-800',
  reframing: 'bg-purple-100 text-purple-800',
  social: 'bg-orange-100 text-orange-800'
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onSelect,
  isSelected = false
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn(
        "cursor-pointer transition-all duration-200",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {skill.title}
            </CardTitle>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              categoryColors[skill.category]
            )}>
              {skill.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{skill.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(skill.duration / 60)} minutes</span>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Steps:</h4>
            <ul className="space-y-1">
              {skill.instructions.slice(0, 2).map((instruction, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-primary font-medium">{index + 1}.</span>
                  {instruction}
                </li>
              ))}
              {skill.instructions.length > 2 && (
                <li className="text-sm text-gray-400">
                  +{skill.instructions.length - 2} more steps...
                </li>
              )}
            </ul>
          </div>

          <Button
            onClick={() => onSelect(skill)}
            className="w-full"
            variant={isSelected ? "default" : "outline"}
          >
            <Play className="w-4 h-4" />
            {isSelected ? "Selected" : "Try This Skill"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}