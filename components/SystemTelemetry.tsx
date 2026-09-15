'use client'

import type { DeviceStatus } from '@/types'
import { formatUptime } from '@/hooks/useSimulation'

interface Props { status: DeviceStatus }

export default function SystemTelemetry({ status }: Props) {
  const tiles = [
    { k: 'PI PACKET COUNT',  v: status.piPacketCount.toLocaleString() },
    { k: 'PI UPTIME',        v: formatUptime(status.piUptime) },
    { k: 'ANDROID LAST PING', v: `${status.androidLastPing}s ago` },
    { k: 'SERVER LAST PUSH',  v: `${status.serverLastPush}s ago` },
  ]

  return (
    <div style={{
      background: 'var(--axon-surface)',
      border: '1px solid var(--axon-border)',
      padding: 16,
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 11, letterSpacing: 2.5, color: 'var(--axon-text-secondary)' }}>
          SYSTEM TELEMETRY
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--axon-text-dim)',
          padding: '2px 6px', background: 'var(--axon-surface-2)', border: '1px solid var(--axon-border)',
        }}>
          EDGE + SERVER
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
        {tiles.map(({ k, v }) => (
          <div key={k} style={{
            background: 'var(--axon-surface-2)',
            border: '1px solid var(--axon-border)',
            padding: 12,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: 9, letterSpacing: 1.5, color: 'var(--axon-text-dim)' }}>{k}</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 18,
              marginTop: 6, color: 'var(--axon-text)', letterSpacing: 0.5,
            }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 12,
        fontFamily: 'var(--font-mono)', fontSize: 9.5,
        letterSpacing: 1, color: 'var(--axon-text-faint)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 5, height: 5, background: 'var(--axon-accent)',
          display: 'inline-block', borderRadius: '50%',
          animation: 'pulseDot 2s ease-in-out infinite',
        }} />
        SYNTHETIC DATA SIMULATION ACTIVE · NO LIVE TELEMETRY
      </div>
    </div>
  )
}
