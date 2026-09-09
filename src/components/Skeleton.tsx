import React from 'react'

export default function Skeleton({ className = 'h-6 w-full rounded bg-gray-200 animate-pulse' }: { className?: string }) {
  return <div className={className} />
}
