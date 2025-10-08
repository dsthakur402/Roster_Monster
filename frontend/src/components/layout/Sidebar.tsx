
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

import { cn } from '@/lib/utils'
import {
  Calendar,
  Users,
  Clock,
  FileText,
  Settings,
  Home,
} from 'lucide-react'



export function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/availability', label: 'Availability', icon: '📅' },
    { path: '/shifts', label: 'Shifts', icon: '🕒' },
    { path: '/leave', label: 'Leave', icon: '🏖️' },
  ]
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Roster', href: '/roster', icon: Calendar },
    { name: 'Staff', href: '/staff', icon: Users },
    { name: 'Leave Requests', href: '/leave', icon: FileText },
    { name: 'Availability', href: '/availability', icon: Clock },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  // Add admin routes if user is admin
  if (user?.userType === 'ADMIN') {
    navItems.push(
      { path: '/users', label: 'Users', icon: '👥' },
      { path: '/settings', label: 'Settings', icon: '⚙️' }
    )
  }

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h2 className="text-xl font-semibold">Menu</h2>
      </div>
      <nav className="mt-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              isActive(item.href) ? 'bg-gray-100 border-l-4 border-blue-500' : ''
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}