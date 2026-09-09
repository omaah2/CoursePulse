import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './AuthProvider'
import MockInbox from './MockInbox'
import { isSupabaseMock } from '../lib/supabase'
import BottomNav from './BottomNav'
import Avatar from './Avatar'
import { ToastProvider } from './ToastProvider'
import ErrorBoundary from './ErrorBoundary'

function InnerLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext()
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  const [showInbox, setShowInbox] = useState<boolean>(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('mock_inbox')
        const has = !!raw && JSON.parse(raw).length > 0
        setShowInbox(isSupabaseMock || has)
      } catch (e) {
        setShowInbox(isSupabaseMock)
      }
    }
    load()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mock_inbox') load()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div className={`min-h-screen flex ${isLogin ? 'bg-[#f4f7f1]' : 'bg-[#f4f7f1]'}`}>
      {isSupabaseMock && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded shadow">
          Mock mode: no backend — emails are not sent
        </div>
      )}
      {/* Sidebar for md+ */}
      {!isLogin && <aside className="hidden w-72 flex-col border-r border-emerald-950/10 bg-[#173b2b] p-6 text-white md:flex">
        <Link to="/" className="mb-12 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300 text-lg text-emerald-950">✦</div><div><div className="text-xl font-bold tracking-tight">CoursePulse</div><div className="text-[10px] text-emerald-100/60">STAY AHEAD</div></div></Link>
        <nav className="flex flex-col gap-2">
          {[['/', 'Overview', '⌂'], ['/courses', 'Courses', '▧'], ['/tasks', 'Tasks', '✓'], ['/calendar', 'Calendar', '□'], ['/insights', 'Insights', '◒']].map(([to, label, icon]) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive ? 'bg-emerald-300 font-semibold text-emerald-950 shadow-lg shadow-emerald-950/10' : 'text-emerald-50/70 hover:bg-white/10 hover:text-white'}`}><span className="w-5 text-center text-lg">{icon}</span>{label}</NavLink>)}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/10 p-3">
          {auth.user ? (
            <div className="flex items-center gap-3">
              <Avatar name={auth.user?.email ?? 'U'} />
              <div>
                <div className="max-w-[150px] truncate text-sm">{auth.user.email}</div>
                <button onClick={() => auth.signOut()} className="text-xs text-emerald-200">Sign out</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-sm text-green-600">Sign in</Link>
          )}
        </div>
      </aside>}

      {/* Mobile header */}
      {!isLogin && <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#f4f7f1]/90 backdrop-blur-sm border-b border-emerald-950/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Toggle menu" onClick={() => setMobileOpen(v => !v)} className="p-2 rounded hover:bg-gray-100">
              ☰
            </button>
            <div className="font-bold">CoursePulse</div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button"
              aria-pressed={showInbox}
              aria-label="Toggle mock inbox"
              onClick={() => setShowInbox(v => !v)}
              className="px-2 py-1 text-sm bg-green-50 text-green-700 rounded"
            >
              Inbox
            </button>
            {auth.user ? (
              <button onClick={() => auth.signOut()} className="text-sm text-red-600">Sign out</button>
            ) : (
              <Link to="/login" className="text-sm text-green-600">Sign in</Link>
            )}
          </div>
        </div>
        {mobileOpen && (
          <div className="px-4 pb-4">
            <nav className="flex flex-col gap-2">
              <Link to="/">Overview</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/tasks">Tasks</Link>
              <Link to="/calendar">Calendar</Link>
              <Link to="/insights">Insights</Link>
            </nav>
          </div>
        )}
      </div>}
      <main className={`flex-1 ${isLogin ? '' : 'p-6 mt-16 md:mt-0'}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Floating Mock Inbox toggle/button for desktop */}
      {!isLogin && <div className="fixed right-4 bottom-24 z-50 hidden md:block">
        <button
          onClick={() => setShowInbox(v => !v)}
          className="px-3 py-2 bg-white border rounded shadow flex items-center gap-2"
        >
          <span className="text-sm">Mock Inbox</span>
        </button>
      </div>}

      {!isLogin && showInbox && <MockInbox />}
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <ToastProvider>
      <AuthProvider>
        <InnerLayout>{children}</InnerLayout>
        {location.pathname !== '/login' && <BottomNav />}
      </AuthProvider>
    </ToastProvider>
  )
}
