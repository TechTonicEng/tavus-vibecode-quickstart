import React from 'react'
import { motion } from 'framer-motion'
import { contextTags } from '@/data/contextTags'
import { ContextTag } from '@/types'
import { cn } from '@/lib/utils'

interface ContextTagSelectorProps {
  selectedTag: ContextTag | null
  onTagSelect: (tag: ContextTag | null) => void
  className?: string
}

export const ContextTagSelector: React.FC<ContextTagSelectorProps> = ({
  selectedTag,
  onTagSelect,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Where are you feeling this way?
        </h3>
        <p className="text-sm text-gray-600">
          (Optional) This helps us understand when you feel different emotions
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <motion.button
          className={cn(
            "px-3 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200",
            !selectedTag
              ? "border-primary bg-primary text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          )}
          onClick={() => onTagSelect(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Skip
        </motion.button>

        {contextTags.map((tag) => (
          <motion.button
            key={tag.id}
            className={cn(
              "px-3 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 flex items-center gap-2",
              selectedTag?.id === tag.id
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            )}
            onClick={() => onTagSelect(tag)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: selectedTag?.id === tag.id ? tag.color : undefined,
              borderColor: selectedTag?.id === tag.id ? tag.color : undefined
            }}
          >
            <span className="text-base">{tag.emoji}</span>
            <span>{tag.label}</span>
          </motion.button>
        ))}
      </div>

      {selectedTag && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-3 bg-gray-50 rounded-lg"
        >
          <p className="text-sm text-gray-700">
            You're feeling this way <strong>{selectedTag.label.toLowerCase()}</strong>
          </p>
        </motion.div>
      )}
    </div>
  )
}