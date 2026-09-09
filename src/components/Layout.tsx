import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './AuthProvider'
import MockInbox from './MockInbox'
import { isSupabaseMock } from '../lib/supabase'
import BottomNav from './BottomNav'
import Avatar from './Avatar'
import { ToastProvider } from './ToastProvider'
import ErrorBoundary from './ErrorBoundary'

function InnerLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext()
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
    <div className="min-h-screen flex bg-gray-50">
      {isSupabaseMock && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded shadow">
          Mock mode: no backend — emails are not sent
        </div>
      )}
      {/* Sidebar for md+ */}
      <aside className="w-72 bg-white/80 backdrop-blur-md border-r p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-6">CoursePulse</h2>
        <nav className="flex flex-col gap-3">
          <Link to="/" className="px-3 py-2 rounded hover:bg-gray-100">Overview</Link>
          <Link to="/courses" className="px-3 py-2 rounded hover:bg-gray-100">Courses</Link>
          <Link to="/tasks" className="px-3 py-2 rounded hover:bg-gray-100">Tasks</Link>
          <Link to="/calendar" className="px-3 py-2 rounded hover:bg-gray-100">Calendar</Link>
          <Link to="/insights" className="px-3 py-2 rounded hover:bg-gray-100">Insights</Link>
        </nav>

        <div className="mt-6">
          {auth.user ? (
            <div className="flex items-center gap-3">
              <Avatar name={auth.user?.email ?? 'U'} />
              <div>
                <div className="text-sm">{auth.user.email}</div>
                <button onClick={() => auth.signOut()} className="text-sm text-red-600">Sign out</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-sm text-green-600">Sign in</Link>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b">
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
      </div>
      <main className="flex-1 p-6 mt-16 md:mt-0">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Floating Mock Inbox toggle/button for desktop */}
      <div className="fixed right-4 bottom-24 z-50 hidden md:block">
        <button
          onClick={() => setShowInbox(v => !v)}
          className="px-3 py-2 bg-white border rounded shadow flex items-center gap-2"
        >
          <span className="text-sm">Mock Inbox</span>
        </button>
      </div>

      {showInbox && <MockInbox />}
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <InnerLayout>{children}</InnerLayout>
        <BottomNav />
      </AuthProvider>
    </ToastProvider>
  )
}
