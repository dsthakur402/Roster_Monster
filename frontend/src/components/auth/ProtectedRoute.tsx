
import React from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireRosterAccess?: boolean
}

export function ProtectedRoute({ 
  children 
}: ProtectedRouteProps) {
  // Temporarily disabled route protection
  return <>{children}</>
}
