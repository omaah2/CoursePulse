import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type User = any

type AuthContextValue = {
  user: User | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // `undefined` means not yet resolved; `null` means unauthenticated
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    let mounted = true

    async function getSession() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      // If supabase session is missing but a local `mock_user` exists (dev mock flow), use it.
      const sessionUser = data.session?.user ?? null
      if (!sessionUser) {
        try {
          const raw = localStorage.getItem('mock_user')
          if (raw) {
            const mockUser = JSON.parse(raw)
            setUser(mockUser)
            return
          }
        } catch (e) {
          // ignore parse errors
        }
      }
      setUser(sessionUser)
    }

    getSession()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      try {
        // handle different shapes from real/mock supabase clients
        if (sub && (sub as any).subscription && typeof (sub as any).subscription.unsubscribe === 'function') {
          ;(sub as any).subscription.unsubscribe()
        } else if (sub && typeof (sub as any).unsubscribe === 'function') {
          ;(sub as any).unsubscribe()
        }
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // ignore when mock client doesn't implement signOut
    }
    localStorage.removeItem('mock_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
