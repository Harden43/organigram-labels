'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setSession, USERS } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [user, setUser] = useState(USERS[0].id)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    const data = await res.json()
    if (data.ok) {
      const u = USERS.find(u => u.id === user)
      setSession(u?.name || user)
      router.push('/')
    } else {
      setError('Incorrect PIN. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f3ef] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-12 h-9 bg-brand-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-extrabold tracking-tight">OG</span>
            </div>
            <span className="font-mono text-sm tracking-widest text-brand-500 uppercase font-medium">Organigram</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Label Generator</h1>
          <p className="text-sm text-gray-500 mt-1">Labelling Operations Tool</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Who are you?</label>
              <select
                value={user}
                onChange={e => setUser(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 focus:border-brand-500 transition-colors"
              >
                {USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Team PIN</label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter PIN"
                maxLength={8}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono tracking-widest focus:border-brand-500 transition-colors"
                autoFocus
              />
              {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Checking...' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-mono">
          Organigram Inc. · Internal Tool
        </p>
      </div>
    </div>
  )
}
