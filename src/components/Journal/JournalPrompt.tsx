import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Mic, MicOff, Send } from 'lucide-react'

interface JournalPromptProps {
  prompt: string
  onSubmit: (response: string) => void
  onSkip: () => void
  className?: string
}

export const JournalPrompt: React.FC<JournalPromptProps> = ({
  prompt,
  onSubmit,
  onSkip,
  className
}) => {
  const [response, setResponse] = useState('')
  const [isListening, setIsListening] = useState(false)

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setResponse(prev => prev + ' ' + transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      alert('Voice input is not supported in your browser')
    }
  }

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Daily Reflection
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-gray-800 font-medium">{prompt}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Your thoughts:
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                disabled={isListening}
                className="flex items-center gap-2"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>
            
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Share your thoughts here..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!response.trim()}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Save Reflection
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
            >
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}