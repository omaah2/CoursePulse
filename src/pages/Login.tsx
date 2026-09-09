import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseMock } from '../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // handle mock magic link flow: /login?mock_token=...&email=...
    const params = new URLSearchParams(location.search)
    const mockToken = params.get('mock_token')
    const emailParam = params.get('email')
    if (mockToken && emailParam) {
      // Prefer the mock helper on the supabase client when available.
      // @ts-ignore
      if (supabase?.auth?._mockSignIn) {
        // @ts-ignore
        supabase.auth._mockSignIn(emailParam).then(() => {
          setMessage('Signed in (mock)')
          navigate('/')
        })
      } else {
        // Fallback: write a local mock_user so AuthProvider can pick it up.
        const mockUser = { id: `mock-${Date.now()}`, email: emailParam }
        localStorage.setItem('mock_user', JSON.stringify(mockUser))
        setMessage('Signed in (mock)')
        navigate('/')
      }
    }
  }, [location.search, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (isSupabaseMock) {
      const res: any = await supabase.auth.signInWithOtp({ email })
      if (res?.error) {
        setMessage(res.error.message || 'Unable to create a mock magic link.')
      } else {
        setMessage('Mock magic link created. Open it from Mock Inbox to sign in.')
      }
      return
    }

    try {
      const res: any = await supabase.auth.signInWithOtp({ email })
      const error = res?.error
      if (error) {
        const msg = String(error.message || '')
        // detect rate-limit-ish messages and create a mock inbox entry so developer can continue
        if (error.status === 429 || /rate/i.test(msg)) {
          const token = btoa(`${email}:${Date.now()}`)
          const link = `${window.location.origin}/login?mock_token=${token}&email=${encodeURIComponent(email)}`
          const key = 'mock_inbox'
          const existing = JSON.parse(localStorage.getItem(key) || '[]')
          existing.unshift({ email, link, createdAt: new Date().toISOString() })
          localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)))
          setMessage('Email rate limit exceeded — a temporary mock magic link was created in Mock Inbox.')
          return
        }

        setMessage(msg)
      } else {
        setMessage('Check your email for the magic link.')
      }
    } catch (err: any) {
      setMessage(err?.message ?? 'Unexpected error')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="you@university.edu"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button className="w-full bg-green-500 text-white p-2 rounded">Send magic link</button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  )
}
