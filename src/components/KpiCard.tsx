import React from 'react'

export default function KpiCard({ title, value, subtitle, color = 'green' }: { title: string; value: string | number; subtitle?: string; color?: 'green' | 'blue' | 'yellow' | 'red' }) {
  const bg = color === 'green' ? 'bg-green-50 text-green-700' : color === 'blue' ? 'bg-blue-50 text-blue-700' : color === 'yellow' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
  return (
    <div role="region" aria-label={title} className={`p-4 rounded-xl shadow ${bg}`}>
      <div className="text-sm">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}
