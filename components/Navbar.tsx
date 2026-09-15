'use client'

import { useState, useEffect } from 'react'

interface Props {
  operator: string
  onLogout: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function Navbar({ operator, onLogout }: Props) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const dt = now.toISOString().slice(0, 10)

  return (
    <nav style={{
      padding: '10px 20px',
      background: 'var(--axon-surface)',
      borderBottom: '1px solid var(--axon-border)',
      borderTop: '2px solid var(--axon-accent)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px',
          border: '1px solid var(--axon-border)',
          background: 'var(--axon-surface-2)',
          fontFamily: 'var(--font-mono)', fontSize: 10.5,
          letterSpacing: 2, color: 'var(--axon-text-secondary)',
        }}>
          <span className="live-dot" />
          CENTRAL MONITORING — LIVE
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: 1, color: 'var(--axon-text-dim)',
        }}>
          <span>{dt} · {ts}</span>
          <span style={{
            color: 'var(--axon-text)',
            borderLeft: '2px solid var(--axon-accent)',
            paddingLeft: 10,
          }}>OPR · {operator}</span>
          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--axon-border-strong)',
              color: 'var(--axon-text-secondary)',
              padding: '5px 12px',
              fontFamily: 'var(--font-inter)', fontWeight: 600,
              fontSize: 10.5, letterSpacing: 2, cursor: 'pointer',
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--axon-accent)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--axon-accent)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--axon-border-strong)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--axon-text-secondary)'
            }}
          >LOGOUT</button>
        </div>
      </div>
    </nav>
  )
}
