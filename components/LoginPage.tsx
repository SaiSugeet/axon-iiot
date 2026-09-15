'use client'

import { useState, useEffect, useRef } from 'react'
import { AUTH_CREDENTIALS, APP_NAME, APP_TAGLINE, APP_SUBTITLE, APP_FOOTER } from '@/lib/constants'

interface Props {
  onAuth: (username: string) => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function LoginPage({ onAuth }: Props) {
  const [user, setUser] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [authenticating, setAuthenticating] = useState(false)
  const [now, setNow] = useState(new Date())
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (authenticating) return
    if (user.trim() === AUTH_CREDENTIALS.username && pw === AUTH_CREDENTIALS.password) {
      setError('')
      setAuthenticating(true)
      timeoutRef.current = setTimeout(() => onAuth(user.trim()), 800)
    } else {
      setError('ACCESS DENIED — Invalid credentials')
    }
  }

  const tsStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} · ${now.toISOString().slice(0, 10)}`

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 20,
      background: 'var(--axon-bg)',
    }}>
      <form onSubmit={submit} style={{
        width: '100%', maxWidth: 400,
        background: 'var(--axon-surface)',
        border: '1px solid var(--axon-border)',
        borderTop: '2px solid var(--axon-accent)',
        padding: '36px 32px 28px',
      }}>
        {/* Logo mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <svg width="52" height="52" viewBox="0 0 32 32" style={{ marginBottom: 12 }}>
            <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="var(--axon-accent)" strokeWidth="1.4" />
            <polyline points="7,16 12,16 14,10 18,22 20,16 25,16" fill="none" stroke="var(--axon-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 26,
            letterSpacing: 6, color: 'var(--axon-text)',
          }}>{APP_NAME}</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5,
            color: 'var(--axon-text-dim)', marginTop: 6, textAlign: 'center', textTransform: 'uppercase',
          }}>{APP_TAGLINE}</div>
          <div style={{
            fontFamily: 'var(--font-inter)', fontSize: 10.5, letterSpacing: 0.5,
            color: 'var(--axon-text-faint)', marginTop: 10, textAlign: 'center', lineHeight: 1.5,
          }}>{APP_SUBTITLE}</div>
        </div>

        <div style={{ borderTop: '1px solid var(--axon-border)', marginBottom: 20 }} />

        {error && (
          <div style={{
            background: 'var(--axon-critical-bg)',
            borderLeft: '3px solid var(--axon-critical)',
            color: 'var(--axon-critical)',
            padding: '10px 12px',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: 0.5, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontFamily: 'var(--font-inter)',
            fontSize: 9.5, letterSpacing: 2, fontWeight: 600,
            color: 'var(--axon-text-dim)', marginBottom: 6,
          }}>OPERATOR ID</label>
          <input
            type="text" autoComplete="off" value={user} disabled={authenticating}
            onChange={e => setUser(e.target.value)} placeholder="enter operator id"
            style={{
              width: '100%', background: 'var(--axon-surface-2)',
              border: '1px solid var(--axon-border)',
              color: 'var(--axon-text)', padding: '11px 14px',
              fontFamily: 'var(--font-mono)', fontSize: 13,
              letterSpacing: 0.5, outline: 'none',
              transition: 'border-color .15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--axon-accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--axon-border)')}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block', fontFamily: 'var(--font-inter)',
            fontSize: 9.5, letterSpacing: 2, fontWeight: 600,
            color: 'var(--axon-text-dim)', marginBottom: 6,
          }}>ACCESS CODE</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'} value={pw} disabled={authenticating}
              onChange={e => setPw(e.target.value)} placeholder="••••••••"
              style={{
                width: '100%', background: 'var(--axon-surface-2)',
                border: '1px solid var(--axon-border)',
                color: 'var(--axon-text)', padding: '11px 58px 11px 14px',
                fontFamily: 'var(--font-mono)', fontSize: 13,
                letterSpacing: 0.5, outline: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--axon-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--axon-border)')}
            />
            <button type="button" onClick={() => setShowPw(v => !v)} disabled={authenticating}
              style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', color: 'var(--axon-text-dim)',
                fontFamily: 'var(--font-mono)', fontSize: 9.5,
                letterSpacing: 1.5, padding: '4px 8px', cursor: 'pointer',
              }}
            >{showPw ? 'HIDE' : 'SHOW'}</button>
          </div>
        </div>

        <button
          type="submit" disabled={authenticating}
          style={{
            width: '100%',
            background: authenticating ? 'var(--axon-surface-2)' : 'var(--axon-accent)',
            color: authenticating ? 'var(--axon-accent)' : '#0A0E14',
            border: authenticating ? '1px solid var(--axon-accent)' : 'none',
            padding: 13, marginTop: 4,
            fontFamily: 'var(--font-inter)', fontWeight: 700,
            fontSize: 12.5, letterSpacing: 3,
            cursor: authenticating ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background .15s',
          }}
        >
          {authenticating && (
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              border: '2px solid var(--axon-accent)', borderTopColor: 'transparent',
              display: 'inline-block', animation: 'pulseDot 0.8s linear infinite',
            }} />
          )}
          {authenticating ? 'AUTHENTICATING…' : 'AUTHENTICATE'}
        </button>

        <div style={{
          marginTop: 20, textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: 1, color: 'var(--axon-text-faint)',
        }}>
          SYSTEM TIME {tsStr}
        </div>

        <div style={{
          marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--axon-border)',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: 0.5, color: 'var(--axon-text-faint)',
        }}>
          {APP_FOOTER}
        </div>
      </form>
    </div>
  )
}
