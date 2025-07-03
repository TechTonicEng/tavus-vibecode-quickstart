import React from 'react'
import { motion } from 'framer-motion'
import { emotions } from '@/data/emotions'
import { MoodOption } from '@/types'
import { cn } from '@/lib/utils'

interface MoodPickerProps {
  selectedMood: MoodOption | null
  onMoodSelect: (mood: MoodOption) => void
  className?: string
}

export const MoodPicker: React.FC<MoodPickerProps> = ({
  selectedMood,
  onMoodSelect,
  className
}) => {
  const handleMoodSelect = (emotion: MoodOption) => {
    console.log('MoodPicker: Mood selected:', emotion)
    onMoodSelect(emotion)
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          How are you feeling today?
        </h2>
        <p className="text-gray-600">
          Pick the character that shows how you feel right now
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {emotions.map((emotion) => (
          <motion.button
            key={emotion.value}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105",
              selectedMood?.value === emotion.value
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
            )}
            onClick={() => handleMoodSelect(emotion)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center space-y-2">
              {emotion.image ? (
                <div className="relative">
                  <img 
                    src={emotion.image} 
                    alt={emotion.label}
                    className="w-16 h-16 mx-auto object-contain"
                    onError={(e) => {
                      console.log(`Failed to load image: ${emotion.image}`)
                      // Hide the image and show emoji fallback
                      e.currentTarget.style.display = 'none';
                      const emojiSpan = e.currentTarget.nextElementSibling as HTMLElement;
                      if (emojiSpan) {
                        emojiSpan.style.display = 'block';
                      }
                    }}
                  />
                  <span 
                    className="text-4xl hidden" 
                  >
                    {emotion.emoji}
                  </span>
                </div>
              ) : (
                <div className="text-4xl">
                  {emotion.emoji}
                </div>
              )}
              <div className="text-sm font-medium text-gray-900">
                {emotion.label}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-primary/10 rounded-2xl"
        >
          <p className="text-primary font-medium">
            You're feeling {selectedMood.label.toLowerCase()}. {selectedMood.description}.
          </p>
        </motion.div>
      )}
    </div>
  )
}