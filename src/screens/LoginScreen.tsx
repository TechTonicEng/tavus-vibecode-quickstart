import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { QRScanner } from '@/components/QRScanner/QRScanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { QrCode, Users, Mail, Lock, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react'

interface LoginScreenProps {
  onStudentLogin: (qrData: string) => void
  onStaffLogin: (email: string, password: string) => void
  isLoading?: boolean
  authError?: string | null
}

type LoginMode = 'select' | 'student' | 'staff' | 'staff-signup'

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onStudentLogin,
  onStaffLogin,
  isLoading = false,
  authError = null
}) => {
  const [mode, setMode] = useState<LoginMode>('select')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      onStaffLogin(email, password)
    }
  }

  const handleStaffSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password && confirmPassword && name) {
      if (password !== confirmPassword) {
        alert('Passwords do not match')
        return
      }
      // For demo purposes, treat signup the same as login
      onStaffLogin(email, password)
    }
  }

  if (mode === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <Button
              variant="ghost"
              onClick={() => setMode('select')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <QRScanner
            onScanSuccess={onStudentLogin}
            onClose={() => setMode('select')}
            isLoading={isLoading}
          />
        </div>
      </div>
    )
  }

  if (mode === 'staff') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Staff Login
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMode('select')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}
            
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!email || !password || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center space-y-2">
                <Button 
                  type="button"
                  variant="link" 
                  className="text-sm"
                  onClick={() => setMode('staff-signup')}
                >
                  Don't have an account? Sign up
                </Button>
                <Button variant="link" className="text-sm">
                  Use Clever/ClassLink SSO
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === 'staff-signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Staff Sign Up
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMode('staff')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}
            
            <form onSubmit={handleStaffSignup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!email || !password || !confirmPassword || !name || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center">
                <Button 
                  type="button"
                  variant="link" 
                  className="text-sm"
                  onClick={() => setMode('staff')}
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Tess</h1>
          <p className="text-gray-600">
            Your emotional support friend is here to help
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={() => setMode('student')}
              size="lg"
              className="w-full h-16 text-lg"
            >
              <QrCode className="w-6 h-6 mr-3" />
              Scan My Code
              <span className="block text-sm opacity-80 ml-3">Student Login</span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => setMode('staff')}
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg"
            >
              <Users className="w-6 h-6 mr-3" />
              Log in as Staff
              <span className="block text-sm opacity-80 ml-3">Teacher/Admin</span>
            </Button>
          </motion.div>
        </div>

        <p className="text-xs text-gray-500">
          Students: Use your school-issued QR code badge<br/>
          Staff: Use your school credentials or SSO
        </p>
      </div>
    </div>
  )
}