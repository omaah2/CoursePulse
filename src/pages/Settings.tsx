import React from 'react'
import { useAuthContext } from '../components/AuthProvider'

export default function Settings() {
  const { user, signOut } = useAuthContext()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium">Account</h3>
        <div className="mt-2">
          <div className="text-sm text-gray-600">Email</div>
          <div className="mt-1">{user?.email ?? 'Not signed in'}</div>
        </div>
        <div className="mt-4">
          <button onClick={() => signOut()} className="px-3 py-2 bg-red-600 text-white rounded">Sign out</button>
        </div>
      </div>
    </div>
  )
}
