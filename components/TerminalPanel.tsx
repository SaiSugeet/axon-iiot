'use client'

import { useEffect, useState } from 'react'

const TTYD_THEME = {
  background: '#0a0e14',
  foreground: '#a8b2c1',
  cursor: '#06b6d4',
  cursorAccent: '#0a0e14',
  selection: 'rgba(6,182,212,0.2)',
  black: '#0a0e14',
  red: '#e06c75',
  green: '#22c55e',
  yellow: '#f59e0b',
  blue: '#06b6d4',
  magenta: '#a78bfa',
  cyan: '#06b6d4',
  white: '#a8b2c1',
  brightBlack: '#4a5568',
  brightRed: '#e06c75',
  brightGreen: '#22c55e',
  brightYellow: '#f59e0b',
  brightBlue: '#06b6d4',
  brightMagenta: '#a78bfa',
  brightCyan: '#06b6d4',
  brightWhite: '#ffffff',
}

const TTYD_URL = `http://localhost:7681?theme=${encodeURIComponent(JSON.stringify(TTYD_THEME))}`

export default function TerminalPanel() {
  const [isLocal, setIsLocal] = useState(false)
  const [iframeFailed, setIframeFailed] = useState(false)

  useEffect(() => {
    const host = window.location.hostname
    setIsLocal(host === 'localhost' || host === '127.0.0.1')
  }, [])

  const showFallback = !isLocal || iframeFailed

  return (
    <div style={{
      background: 'var(--axon-surface)',
      border: '1px solid var(--axon-border)',
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 0,
      overflow: 'hidden',
    }}>
      {!showFallback && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--axon-border)',
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 11,
            letterSpacing: 2.5, color: 'var(--axon-text-secondary)',
          }}>
            AXON TERMINAL
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="status-dot" />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5,
              color: 'var(--axon-text-dim)',
              padding: '2px 6px', background: 'var(--axon-surface-2)', border: '1px solid var(--axon-border)',
            }}>
              LOCAL
            </span>
          </div>
        </div>
      )}

      {!showFallback ? (
        <div style={{ flex: 1, minHeight: 0, background: '#0a0e14' }}>
          <iframe
            src={TTYD_URL}
            title="AXON Terminal"
            onError={() => setIframeFailed(true)}
            style={{ width: '100%', height: '100%', border: 'none', background: '#000000' }}
          />
        </div>
      ) : (
        <div style={{
          flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: 16,
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="var(--axon-accent)" strokeWidth="1.4" />
            <polyline points="7,16 12,16 14,10 18,22 20,16 25,16" fill="none" stroke="var(--axon-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{
            fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13,
            letterSpacing: 1.5, color: 'var(--axon-text)', textAlign: 'center',
          }}>
            LOCAL NETWORK TERMINAL
          </div>
          <div style={{
            fontFamily: 'var(--font-inter)', fontSize: 10.5, letterSpacing: 0.3,
            color: 'var(--axon-text-dim)', textAlign: 'center',
          }}>
            Available when running on local network
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1,
            color: 'var(--axon-accent)', textAlign: 'center',
          }}>
            ttyd &middot; port 7681 &middot; axon:demo
          </div>
        </div>
      )}
    </div>
  )
}
