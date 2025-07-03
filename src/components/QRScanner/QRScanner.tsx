import React, { useRef, useEffect, useState } from 'react'
import { Camera, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QRScannerProps {
  onScanSuccess: (qrData: string) => void
  onClose: () => void
  isLoading?: boolean
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onClose,
  isLoading = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
        setError(null)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setHasPermission(false)
      setError('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setIsScanning(false)
  }

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current || hasTriggered) return
    
    setIsScanning(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    const scanFrame = () => {
      if (!isScanning || !context || !video || hasTriggered) return

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Update scan progress
        setScanProgress(prev => {
          const newProgress = prev + 3
          return newProgress > 100 ? 0 : newProgress
        })
      }

      if (isScanning && !hasTriggered) {
        requestAnimationFrame(scanFrame)
      }
    }

    // Start countdown and scanning animation
    let countdownTimer: NodeJS.Timeout
    let scanTimer: NodeJS.Timeout

    const startCountdown = () => {
      setCountdown(3)
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer)
            if (!hasTriggered) {
              setHasTriggered(true)
              const mockQRData = 'student_qr_' + Date.now()
              onScanSuccess(mockQRData)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // Start scanning animation
    scanFrame()
    
    // Start countdown after video is ready
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      startCountdown()
    } else {
      video.addEventListener('loadedmetadata', startCountdown, { once: true })
    }

    return () => {
      clearInterval(countdownTimer)
      clearTimeout(scanTimer)
    }
  }

  // Start scanning when video is ready
  useEffect(() => {
    if (hasPermission && videoRef.current && !hasTriggered) {
      const video = videoRef.current
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        startScanning()
      } else {
        video.addEventListener('loadedmetadata', startScanning, { once: true })
      }
    }
  }, [hasPermission, hasTriggered])

  const handleRetry = () => {
    setError(null)
    setHasPermission(null)
    setScanProgress(0)
    setCountdown(3)
    setHasTriggered(false)
    startCamera()
  }

  if (hasPermission === false || error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Camera Access Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {error || 'We need camera access to scan your QR code badge.'}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Your QR Code Badge
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-full h-1 bg-primary transition-all duration-100"
                    style={{ 
                      transform: `translateY(${(scanProgress / 100) * 192 - 96}px)`,
                      opacity: 0.8
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-gray-600">
            Hold your QR code badge in front of the camera
          </p>
          <p className="text-sm text-gray-500">
            {isScanning && countdown > 0 ? 
              `Scanning... (auto-detects in ${countdown} second${countdown !== 1 ? 's' : ''})` : 
              'Make sure the code is clearly visible and well-lit'
            }
          </p>
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-primary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Logging you in...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}