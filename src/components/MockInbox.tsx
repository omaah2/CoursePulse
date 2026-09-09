import React, { useEffect, useMemo, useState } from 'react'

type Item = { email: string; link: string; createdAt: string }

export default function MockInbox() {
  const [items, setItems] = useState<Item[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem('mock_inbox') || '[]'
      try {
        setItems(JSON.parse(raw))
      } catch {
        setItems([])
      }
    }
    load()
    window.addEventListener('storage', load)
    window.addEventListener('mock-inbox-updated', load)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('mock-inbox-updated', load)
    }
  }, [])

  const filtered = useMemo(() => {
    if (!q) return items
    const s = q.toLowerCase()
    return items.filter(i => i.email.toLowerCase().includes(s) || i.link.toLowerCase().includes(s))
  }, [items, q])

  if (items.length === 0) return null

  return (
    <div role="dialog" aria-label="Mock Inbox" className="fixed right-4 bottom-4 w-96 max-h-96 overflow-auto bg-white border rounded shadow p-3 z-50">
      <div className="flex items-center justify-between mb-2">
        <strong>Mock Inbox</strong>
        <div className="flex items-center gap-2">
          <button
            className="text-sm text-gray-600"
            onClick={() => {
              navigator.clipboard?.writeText(JSON.stringify(items))
            }}
          >
            Export
          </button>
          <button
            className="text-sm text-blue-600"
            onClick={() => {
              localStorage.removeItem('mock_inbox')
              setItems([])
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <label className="sr-only" htmlFor="mock-inbox-search">Search mock inbox</label>
      <input
        id="mock-inbox-search"
        aria-label="Search mock inbox"
        placeholder="Search email or link"
        value={q}
        onChange={e => setQ(e.target.value)}
        className="w-full mb-3 p-2 border rounded text-sm"
      />

      <div className="text-xs text-gray-500 mb-2">{filtered.length} result(s)</div>

      <ul className="space-y-2">
        {filtered.map((it, idx) => (
          <li key={idx} className="border p-2 rounded">
            <div className="text-sm text-gray-600">{it.email}</div>
            <div className="text-xs break-words mt-1">{it.link}</div>
            <div className="flex gap-2 mt-2">
              <button type="button"
                aria-label={`Open mock link for ${it.email}`}
                className="text-sm text-green-600"
                onClick={() => {
                  // navigate in-place so the app can pick up mock_token
                  location.href = it.link
                }}
              >
                Open
              </button>
              <button type="button"
                aria-label={`Copy mock link for ${it.email}`}
                className="text-sm text-gray-600"
                onClick={() => {
                  navigator.clipboard?.writeText(it.link)
                }}
              >
                Copy
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
