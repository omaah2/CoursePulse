import React from 'react'

export default function Avatar({ name, size = 40 }: { name?: string; size?: number }) {
  const initials = (name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
  const style: React.CSSProperties = { width: size, height: size }
  return (
    <div style={style} className="rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold">
      {initials}
    </div>
  )
}
