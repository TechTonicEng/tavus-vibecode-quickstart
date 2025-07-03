import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { useDaily, useLocalSessionId, useParticipantIds, useDailyEvent } from '@daily-co/daily-react'
import { currentSessionAtom, selectedMoodAtom, selectedSkillAtom } from '@/store/session'
import { conversationAtom } from '@/store/conversation'
import { TessAvatar } from '@/components/Avatar/TessAvatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Volume2, VolumeX, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionViewProps {
  onSessionEnd: () => void
}

export const SessionView: React.FC<SessionViewProps> = ({ onSessionEnd }) => {
  const [conversation] = useAtom(conversationAtom)
  const [selectedMood] = useAtom(selectedMoodAtom)
  const [selectedSkill] = useAtom(selectedSkillAtom)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)
  const [isConnecting, setIsConnecting] = useState(true)

  const daily = useDaily()
  const localSessionId = useLocalSessionId()
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' })

  // Timer for session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Join the conversation when URL is available
  useEffect(() => {
    if (conversation?.conversation_url && daily) {
      console.log('Joining Daily call with URL:', conversation.conversation_url)
      setIsConnecting(true)
      
      daily.join({
        url: conversation.conversation_url,
        startVideoOff: true,
        startAudioOff: false
      }).then(() => {
        console.log('Successfully joined Daily call')
        setIsConnecting(false)
      }).catch((error) => {
        console.error('Failed to join Daily call:', error)
        setIsConnecting(false)
      })
    }
  }, [conversation?.conversation_url, daily])

  // Handle participant events
  useDailyEvent('participant-joined', (event) => {
    console.log('Participant joined:', event.participant)
    if (event.participant.user_id !== localSessionId) {
      setIsConnecting(false)
    }
  })

  useDailyEvent('participant-left', (event) => {
    console.log('Participant left:', event.participant)
  })

  useDailyEvent('joined-meeting', (event) => {
    console.log('Joined meeting:', event)
    setIsConnecting(false)
  })

  useDailyEvent('error', (event) => {
    console.error('Daily error:', event)
    setIsConnecting(false)
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMicToggle = () => {
    if (daily) {
      daily.setLocalAudio(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const handleSpeakerToggle = () => {
    // In a real implementation, this would control speaker output
    setIsSpeakerOn(!isSpeakerOn)
  }

  const handleEndSession = () => {
    if (daily) {
      daily.leave()
    }
    onSessionEnd()
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                remoteParticipantIds.length > 0 ? "bg-green-500 animate-pulse" : "bg-yellow-500"
              )}></div>
              <span className="text-sm font-medium text-gray-700">
                {isConnecting ? 'Connecting to Tess...' : 'Session with Tess'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(sessionTime)}
            </div>
          </div>
          
          {selectedMood && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
              <span className="text-lg">{selectedMood.emoji}</span>
              <span className="text-sm font-medium text-primary">
                {selectedMood.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Avatar Section */}
        <div className="flex-1 p-6">
          <TessAvatar
            sessionId={remoteParticipantIds[0]}
            className="w-full h-full max-w-2xl mx-auto"
            isLoading={isConnecting || remoteParticipantIds.length === 0}
          />
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-black/10 rounded-lg text-sm">
              <p>Debug Info:</p>
              <p>Conversation URL: {conversation?.conversation_url ? 'Set' : 'Not set'}</p>
              <p>Local Session ID: {localSessionId || 'None'}</p>
              <p>Remote Participants: {remoteParticipantIds.length}</p>
              <p>Is Connecting: {isConnecting.toString()}</p>
              <p>Daily Instance: {daily ? 'Available' : 'Not available'}</p>
            </div>
          )}
        </div>

        {/* Skill Instructions Sidebar */}
        {selectedSkill && (
          <div className="w-80 p-6 bg-white/50 backdrop-blur-sm border-l border-gray-200">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {selectedSkill.title}
                </h3>
                <p className="text-gray-600 mb-4">{selectedSkill.description}</p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Follow along:</h4>
                  {selectedSkill.instructions.map((instruction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.5 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{instruction}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={handleMicToggle}
            className="w-12 h-12"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={!isSpeakerOn ? "destructive" : "outline"}
            size="icon"
            onClick={handleSpeakerToggle}
            className="w-12 h-12"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          <Button
            variant="destructive"
            onClick={handleEndSession}
            className="px-6"
          >
            <Phone className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      </div>
    </div>
  )
}