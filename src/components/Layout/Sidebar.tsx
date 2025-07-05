import React from 'react'
import { cn } from '@/lib/utils'
import { Home, BookOpen, BarChart3, Gamepad2, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Student, Educator } from '@/types'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  onLogout: () => void
  userType: 'student' | 'staff' | null
  currentUser: Student | Educator | null
}

const studentNavigation = [
  { id: 'home', label: 'Home', icon: Home, description: 'Begin daily check-in' },
  { id: 'sessions', label: 'My Sessions', icon: BookOpen, description: 'Mood history & progress' },
  { id: 'skills', label: 'SEL Skills', icon: BarChart3, description: 'Browse & favorite skills' },
  { id: 'games', label: 'Mini-Games', icon: Gamepad2, description: 'Play SEL games' },
  { id: 'profile', label: 'Profile', icon: User, description: 'View goals & toolbox' },
]

const staffNavigation = [
  { id: 'home', label: 'Dashboard', icon: Home, description: 'Overview & analytics' },
  { id: 'sessions', label: 'All Sessions', icon: BookOpen, description: 'Student sessions' },
  { id: 'skills', label: 'Skills Library', icon: BarChart3, description: 'Manage SEL skills' },
  { id: 'games', label: 'Mini-Games', icon: Gamepad2, description: 'Game management' },
  { id: 'profile', label: 'Profile', icon: User, description: 'Account settings' },
]

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  onLogout,
  userType, 
  currentUser 
}) => {
  const navigation = userType === 'staff' ? staffNavigation : studentNavigation

  const getUserDisplayInfo = () => {
    if (!currentUser) return { name: 'User', subtitle: '', avatar: 'U' }
    
    if (userType === 'student') {
      const student = currentUser as Student
      return {
        name: student.name,
        subtitle: `Grade ${student.grade}`,
        avatar: student.name.charAt(0).toUpperCase()
      }
    } else {
      const educator = currentUser as Educator
      return {
        name: educator.name,
        subtitle: 'Staff',
        avatar: educator.name.charAt(0).toUpperCase()
      }
    }
  }

  const { name, subtitle, avatar } = getUserDisplayInfo()

  return (
    <div className="w-20 lg:w-72 bg-white border-r border-tess-gray flex flex-col shadow-sm">
      {/* Logo Section */}
      <div className="p-4 lg:p-6 border-b border-tess-gray">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tess-peach to-tess-blue flex items-center justify-center shadow-md">
            <img 
              src="/logo.png" 
              alt="TESS Logo" 
              className="w-8 h-8"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = '<span class="text-white font-bold text-lg">T</span>'
                }
              }}
            />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-xl text-tess-text">TESS</h1>
            <p className="text-sm text-tess-text-light">Emotional Support</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 lg:px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <button
              key={item.id}
              className={cn(
                "nav-item w-full text-left group",
                isActive && "active"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isActive 
                    ? "bg-white shadow-sm" 
                    : "bg-tess-gray group-hover:bg-tess-peach/30"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="hidden lg:block flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-tess-text-light">{item.description}</div>
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 lg:p-6 border-t border-tess-gray space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-tess-blue to-tess-green rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-sm font-semibold text-tess-text">
              {avatar}
            </span>
          </div>
          <div className="hidden lg:block flex-1">
            <p className="text-sm font-semibold text-tess-text truncate">{name}</p>
            <p className="text-xs text-tess-text-light">{subtitle}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start gap-2 text-tess-text-light hover:text-tess-text hover:bg-tess-gray"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden lg:block">Logout</span>
        </Button>
      </div>
    </div>
  )
}