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
    onMoodSelect(emotion)
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-tess-text">
          How are you feeling today?
        </h2>
        <p className="text-lg text-tess-text-light">
          Pick the character that shows how you feel right now
        </p>
      </div>

      {/* Mood Grid - 3x5 layout */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
        {emotions.map((emotion) => (
          <motion.button
            key={emotion.value}
            className={cn(
              "mood-card group relative flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-100",
              selectedMood?.value === emotion.value
                ? "selected border-tess-peach bg-tess-peach/10"
                : "hover:border-tess-peach/50 hover:bg-tess-peach/5"
            )}
            onClick={() => handleMoodSelect(emotion)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Character Display */}
            <div className="relative mb-3">
              {emotion.image ? (
                <>
                  <img 
                    src={emotion.image} 
                    alt={emotion.label}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform group-hover:scale-110"
                    onError={(e) => {
                      // Hide the image and show emoji fallback
                      e.currentTarget.style.display = 'none';
                      const emojiSpan = e.currentTarget.nextElementSibling as HTMLElement;
                      if (emojiSpan) {
                        emojiSpan.style.display = 'block';
                      }
                    }}
                  />
                  <span 
                    className="text-4xl md:text-5xl hidden transition-transform group-hover:scale-110" 
                  >
                    {emotion.emoji}
                  </span>
                </>
              ) : (
                <div className="text-4xl md:text-5xl transition-transform group-hover:scale-110">
                  {emotion.emoji}
                </div>
              )}
              
              {/* Selection indicator */}
              {selectedMood?.value === emotion.value && (
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-tess-peach rounded-full flex items-center justify-center shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <span className="text-white text-sm font-bold">✓</span>
                </motion.div>
              )}
            </div>

            {/* Label */}
            <div className="text-center">
              <div className="text-sm md:text-base font-semibold text-tess-text">
                {emotion.label}
              </div>
            </div>

            {/* Hover glow effect */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{ backgroundColor: emotion.color }}
            />
          </motion.button>
        ))}
      </div>

      {/* Selected mood feedback */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-white rounded-3xl shadow-lg border border-tess-peach/20 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-3xl">{selectedMood.emoji}</div>
            <div>
              <h3 className="text-xl font-semibold text-tess-text">
                You're feeling {selectedMood.label.toLowerCase()}
              </h3>
              <p className="text-tess-text-light">
                {selectedMood.description}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-tess-text-light">
              That's completely okay! Let's find a helpful skill to practice together.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}