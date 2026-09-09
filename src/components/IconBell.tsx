import React from 'react'

export default function IconBell({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 17H9l-1 2h8l-1-2z" fill="#374151" opacity="0.9" />
      <path d="M12 3a4 4 0 00-4 4v1.1c0 .6-.2 1.2-.6 1.7L6 12v1h12v-1l-1.4-2.2c-.4-.5-.6-1.1-.6-1.7V7a4 4 0 00-4-4z" fill="#374151" opacity="0.9" />
    </svg>
  )
}
