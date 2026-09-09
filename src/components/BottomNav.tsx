import React from 'react'
import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg md:hidden">
      <div className="flex gap-6 items-center">
        <NavLink to="/" className={({ isActive }) => isActive ? 'text-green-600' : 'text-gray-600'}>
          <span className="sr-only">Overview</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </NavLink>

        <NavLink to="/courses" className={({ isActive }) => isActive ? 'text-green-600' : 'text-gray-600'}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v6" />
          </svg>
        </NavLink>

        <NavLink to="/tasks" className={({ isActive }) => isActive ? 'text-green-600' : 'text-gray-600'}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>
        </NavLink>

        <NavLink to="/calendar" className={({ isActive }) => isActive ? 'text-green-600' : 'text-gray-600'}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </NavLink>
      </div>
    </nav>
  )
}
