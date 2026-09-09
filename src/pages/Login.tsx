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
      // Demo mode has no mail provider, so complete the local sign-in directly.
      // @ts-ignore
      if (supabase?.auth?._mockSignIn) {
        // @ts-ignore
        await supabase.auth._mockSignIn(email)
        navigate('/')
        return
      }
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
    <div className="min-h-[calc(100vh-3rem)] w-full max-w-full overflow-hidden bg-[#f4f7f1]">
      <div className="grid min-h-[calc(100vh-3rem)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden bg-[#173b2b] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[42px] border-emerald-300/10" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative z-10 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300 text-xl text-emerald-950">✦</div><div><div className="text-xl font-bold tracking-tight">CoursePulse</div><div className="text-xs text-emerald-100/70">Stay focused. Stay ahead.</div></div></div>
          <div className="relative z-10 max-w-xl"><p className="mb-5 text-sm font-medium uppercase tracking-[.24em] text-emerald-200">Your academic command center</p><h1 className="text-5xl font-semibold leading-[1.05]">Make progress feel<br /><span className="text-emerald-300">visible.</span></h1><p className="mt-6 max-w-md text-lg leading-8 text-emerald-50/75">Bring courses, deadlines, and your next best action into one calm, intelligent workspace.</p><div className="mt-10 grid max-w-md grid-cols-3 gap-3"><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><div className="text-2xl font-semibold">01</div><div className="mt-1 text-xs text-emerald-100/70">Plan clearly</div></div><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><div className="text-2xl font-semibold">02</div><div className="mt-1 text-xs text-emerald-100/70">Focus daily</div></div><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><div className="text-2xl font-semibold">03</div><div className="mt-1 text-xs text-emerald-100/70">Finish stronger</div></div></div></div>
          <div className="relative z-10 text-sm text-emerald-100/60">Designed for students who want less noise and more momentum.</div>
        </section>
        <section className="flex items-center justify-center px-6 py-12 sm:px-12"><div className="w-full max-w-md"><div className="mb-10 flex items-center gap-3 lg:hidden"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">✦</div><span className="text-xl font-bold">CoursePulse</span></div><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-emerald-600">Welcome back</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">Your next win<br />starts here.</h2><p className="mt-4 leading-7 text-gray-500">Sign in with your university email and we’ll send a secure magic link.</p></div><form onSubmit={handleSubmit} className="space-y-4"><label className="block text-sm font-semibold text-gray-700" htmlFor="email">University email</label><div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span><input id="email" type="email" required placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-10 pr-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></div><button className="group flex w-full items-center justify-between rounded-2xl bg-[#173b2b] px-5 py-4 font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700"><span>Send magic link</span><span className="text-xl transition-transform group-hover:translate-x-1">→</span></button></form>{message && <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">{message}</div>}<div className="mt-10 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" />Private and secure<span className="h-px flex-1 bg-gray-200" /></div></div></section>
      </div>
    </div>
  )
}
