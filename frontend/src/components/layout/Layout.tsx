import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuth()

  // Don't show layout for auth pages
  if (location.pathname.startsWith('/auth')) {
    return <>{children}</>
  }

  // Show loading state
  if (loading) {
    return <div>Loading...</div>
  }

  // Redirect to login if not authenticated and not already on login page
  if (!user && !location.pathname.startsWith('/auth')) {
    const currentPath = location.pathname
    if (currentPath !== '/auth/login') {
      navigate('/auth/login')
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}