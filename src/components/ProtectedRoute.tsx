import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from './AuthProvider'
import Skeleton from './Skeleton'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()

  // loading
  if (user === undefined) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-64" />
      </div>
    )
  }

  if (user === null) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
