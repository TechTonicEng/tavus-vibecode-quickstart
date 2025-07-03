import React from 'react'
import { cn } from '@/lib/utils'
import { Home, BookOpen, BarChart3, Settings, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAtom } from 'jotai'
import { logoutAtom } from '@/store/auth'
import { Student, Educator } from '@/types'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  userType: 'student' | 'staff' | null
  currentUser: Student | Educator | null
}

const studentNavigation = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'sessions', label: 'My Sessions', icon: BookOpen },
  { id: 'skills', label: 'SEL Skills', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
]

const staffNavigation = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'sessions', label: 'All Sessions', icon: BookOpen },
  { id: 'skills', label: 'Skills Library', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
]

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  userType, 
  currentUser 
}) => {
  const [, logout] = useAtom(logoutAtom)
  
  const navigation = userType === 'staff' ? staffNavigation : studentNavigation

  const handleLogout = () => {
    logout()
  }

  const getUserDisplayInfo = () => {
    if (!currentUser) return { name: 'User', subtitle: '' }
    
    if (userType === 'student') {
      const student = currentUser as Student
      return {
        name: student.name,
        subtitle: `Grade ${student.grade}`
      }
    } else {
      const educator = currentUser as Educator
      return {
        name: educator.name,
        subtitle: 'Staff'
      }
    }
  }

  const { name, subtitle } = getUserDisplayInfo()

  return (
    <div className="w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-xl text-gray-900">Tess</h1>
            <p className="text-sm text-gray-500">Your friend</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 lg:px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12",
                isActive && "bg-primary text-white",
                !isActive && "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden lg:block">{item.label}</span>
            </Button>
          )
        })}
      </nav>

      <div className="p-4 lg:p-6 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden lg:block flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden lg:block">Logout</span>
        </Button>
      </div>
    </div>
  )
}