import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Treat obvious placeholder values as missing so we don't create a client that points
// at a non-existent host (which causes runtime network errors).
const isPlaceholder = (v: string) => !v || v.includes('your-project') || v.includes('your-anon-key') || v.includes('REPLACE')

function makeNoopClient() {
	const noop = async () => ({ data: null, error: null })
	const storageKey = (table: string) => `coursepulse_${table}`
	const readRows = (table: string) => {
		try {
			return JSON.parse(localStorage.getItem(storageKey(table)) || '[]')
		} catch {
			return []
		}
	}
	const writeRows = (table: string, rows: any[]) => {
		localStorage.setItem(storageKey(table), JSON.stringify(rows))
		window.dispatchEvent(new Event('mock-data-updated'))
	}
	const makeQuery = (table: string, operation: 'select' | 'insert' | 'update' | 'delete', payload?: any) => {
		let filters: Array<[string, any]> = []
		let one = false
		const query: any = {
			select: () => query,
			eq: (column: string, value: any) => { filters.push([column, value]); return query },
			single: () => { one = true; return query },
			then: (resolve: any, reject: any) => Promise.resolve().then(() => {
				let rows = readRows(table)
				if (operation === 'insert') {
					const entries = Array.isArray(payload) ? payload : [payload]
					const created = entries.map(entry => ({ ...entry, id: entry.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }))
					rows = [...rows, ...created]
					writeRows(table, rows)
					return { data: one ? created[0] : created, error: null }
				}
				const matches = (row: any) => filters.every(([column, value]) => row[column] === value)
				if (operation === 'update') {
					rows = rows.map(row => matches(row) ? { ...row, ...payload } : row)
					writeRows(table, rows)
					const updated = rows.filter(matches)
					return { data: one ? updated[0] : updated, error: null }
				}
				if (operation === 'delete') {
					const deleted = rows.filter(matches)
					writeRows(table, rows.filter(row => !matches(row)))
					return { data: deleted, error: null }
				}
				const selected = rows.filter(matches)
				return { data: one ? selected[0] : selected, error: null }
			}).then(resolve, reject),
		}
		return query
	}

	let currentUser: any = null
	const listeners: Array<(event: string, session: any) => void> = []

	function notify(event: string, session: any) {
		for (const cb of listeners) {
			try {
				cb(event, session)
			} catch (e) {
				// ignore
			}
		}
	}

	return {
		auth: {
			getSession: async () => ({ data: { session: currentUser ? { user: currentUser } : null } }),
			onAuthStateChange: (cb: (event: string, session: any) => void) => {
				listeners.push(cb)
				const subscription = {
					unsubscribe: () => {
						const idx = listeners.indexOf(cb)
						if (idx >= 0) listeners.splice(idx, 1)
					},
				}
				return { data: { subscription } }
			},
			signInWithOtp: async (opts: any) => {
				try {
					const email = opts?.email ?? 'unknown'
					const token = btoa(`${email}:${Date.now()}`)
					const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
					const link = `${origin}/login?mock_token=${token}&email=${encodeURIComponent(email)}`
					// persist into localStorage inbox
					const key = 'mock_inbox'
					const existing = JSON.parse(localStorage.getItem(key) || '[]')
					existing.unshift({ email, link, createdAt: new Date().toISOString() })
					localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)))
					window.dispatchEvent(new Event('mock-inbox-updated'))
					return { data: { email, link }, error: null }
				} catch (err) {
					return { data: null, error: { message: 'mock signIn failed' } }
				}
			},
			signOut: async () => {
				currentUser = null
				notify('SIGNED_OUT', null)
				return { error: null }
			},
			// developer helper to complete a mock sign-in (used by mock magic links)
			_mockSignIn: async (email: string) => {
				currentUser = { id: `mock-${Date.now()}`, email }
				localStorage.setItem('mock_user', JSON.stringify(currentUser))
				const session = { user: currentUser }
				notify('SIGNED_IN', session)
				return { data: { session }, error: null }
			},
		},
		from: (_: string) => ({
			select: () => makeQuery(_, 'select'),
			insert: (payload: any) => makeQuery(_, 'insert', payload),
			update: (payload: any) => makeQuery(_, 'update', payload),
			delete: () => makeQuery(_, 'delete'),
		}),
		rpc: noop,
	}
}

// Choose either a real supabase client or a noop client, then export a single top-level
// `supabase` binding (avoid `export` inside blocks which is a syntax error).
// Allow forcing mock mode in the browser for development by setting
// `localStorage.SUPABASE_MOCK = '1'` — useful when you have env vars but want to work offline.
let forceMock = false
try {
	if (typeof window !== 'undefined' && window.localStorage) {
		forceMock = window.localStorage.getItem('SUPABASE_MOCK') === '1'
	}
} catch (e) {
	// ignore
}

const isSupabaseMock = forceMock || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseKey)

let supabaseClient: any
if (isSupabaseMock) {
	// Provide a safe fallback so the app can run without env vars for UI development.
	// eslint-disable-next-line no-console
	if (forceMock) {
		console.warn('Supabase mock forced via localStorage.SUPABASE_MOCK=1 — using noop client.')
	} else {
		console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or placeholder. Supabase client will be a noop. Create a .env file from .env.example to enable real backend.')
	}
	supabaseClient = makeNoopClient()
} else {
	supabaseClient = createClient(supabaseUrl, supabaseKey)
}

// Export the chosen client and a flag so the app can detect mock mode
// @ts-ignore
export const supabase = supabaseClient
export { isSupabaseMock }
