import React from 'react'
import { motion } from 'framer-motion'
import { SELSkill } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Star, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoriteSkillsToolboxProps {
  favoriteSkills: SELSkill[]
  onSkillSelect: (skill: SELSkill) => void
  className?: string
}

const categoryColors = {
  breathing: 'bg-blue-100 text-blue-800',
  mindfulness: 'bg-green-100 text-green-800',
  reframing: 'bg-purple-100 text-purple-800',
  social: 'bg-orange-100 text-orange-800'
}

export const FavoriteSkillsToolbox: React.FC<FavoriteSkillsToolboxProps> = ({
  favoriteSkills,
  onSkillSelect,
  className
}) => {
  if (favoriteSkills.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            My Toolbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Practice some skills and add your favorites here!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          My Toolbox
          <span className="text-sm font-normal text-gray-500">
            ({favoriteSkills.length} favorite{favoriteSkills.length !== 1 ? 's' : ''})
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {favoriteSkills.map((skill) => (
          <motion.div
            key={skill.id}
            whileHover={{ scale: 1.02 }}
            className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{skill.title}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    categoryColors[skill.category]
                  )}>
                    {skill.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{skill.description}</p>
              </div>
              
              <Button
                size="sm"
                onClick={() => onSkillSelect(skill)}
                className="ml-3"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}