import React, { useEffect, useRef } from 'react'
import { DailyVideo, useVideoTrack } from '@daily-co/daily-react'
import { cn } from '@/lib/utils'

interface TessAvatarProps {
  sessionId?: string
  className?: string
  isLoading?: boolean
}

export const TessAvatar: React.FC<TessAvatarProps> = ({
  sessionId,
  className,
  isLoading = false
}) => {
  const videoState = useVideoTrack(sessionId || '')

  console.log('TessAvatar render:', { sessionId, isLoading, videoState })

  if (isLoading || !sessionId) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center",
        className
      )}>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/30 rounded-full animate-pulse mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-primary/20 rounded w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-primary/10 rounded w-24 mx-auto animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-600">
            {isLoading ? 'Connecting to Tess...' : 'Waiting for Tess to join...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10",
      className
    )}>
      <DailyVideo
        sessionId={sessionId}
        type="video"
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
        <div className="text-white text-center">
          <h3 className="font-semibold">Tess</h3>
          <p className="text-sm opacity-90">Your emotional support friend</p>
        </div>
      </div>
      
      {/* Debug overlay in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-2 rounded">
          Session: {sessionId}<br/>
          Video: {videoState.isOff ? 'Off' : 'On'}
        </div>
      )}
    </div>
  )
}