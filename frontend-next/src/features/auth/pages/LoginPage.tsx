'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginPasswordAction } from '@/features/auth/actions/authAction'

/**
 * Login page (FSD: feature/auth/pages)
 * Client Component for password-based authentication.
 */

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await loginPasswordAction(password)

      if (result.success) {
        // Clear form and redirect to home
        setPassword('')
        router.push('/')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>PPTX Maker - Login</h1>
      <form
        onSubmit={handleLogin}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '300px',
          margin: '2rem auto',
          padding: '2rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="password" style={{ fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Enter password"
            style={{
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}
      </form>
    </main>
  )
}
