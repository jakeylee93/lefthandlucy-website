'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const response = await fetch('/api/cms/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (!response.ok) {
      setError('That password was not accepted.')
      return
    }
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-lucy-cream px-6 py-16 text-lucy-charcoal flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/10 border border-black/5">
        <p className="text-lucy-sage text-xs font-black tracking-[0.25em] uppercase mb-3">Left Hand Lucy CMS</p>
        <h1 className="text-4xl font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Admin login</h1>
        <p className="text-sm text-lucy-grey leading-relaxed mb-6">Enter the admin password to edit visible website text and manage revisions.</p>
        <label className="block text-xs font-bold uppercase tracking-wide text-lucy-grey mb-2" htmlFor="password">Admin password</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl bg-lucy-cream px-5 py-4 text-lucy-charcoal outline-none border-2 border-transparent focus:border-lucy-sage" />
        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-full bg-lucy-sage px-6 py-4 text-sm font-black text-white transition hover:bg-lucy-sage/90 disabled:opacity-60">{loading ? 'Checking…' : 'Log in'}</button>
        <Link href="/" className="mt-5 block text-center text-sm font-bold text-lucy-grey hover:text-lucy-sage">Back to website</Link>
      </form>
    </main>
  )
}
