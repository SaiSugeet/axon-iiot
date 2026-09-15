'use client'

import type { DeviceStatus } from '@/types'

interface Props { status: DeviceStatus }

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/**
 * Derived, presentation-only heartbeat-delivery estimate — not part of the
 * simulation model in hooks/useSimulation.ts. Computed from the existing
 * MQTT connection flag and the last-ping / last-push telemetry already
 * produced by the hook.
 */
function deliveryRate(status: DeviceStatus): number {
  const base = status.androidMqttConnected ? 100 : 0
  const pingPenalty = status.androidLastPing * 6
  const pushPenalty = status.serverLastPush * 4
  return clamp(base - pingPenalty - pushPenalty, 0, 100)
}

function bandColor(pct: number): string {
  if (pct >= 80) return 'var(--axon-accent)'
  if (pct >= 50) return 'var(--axon-monitor)'
  return 'var(--axon-critical)'
}

export default function SignalContinuity({ status }: Props) {
  const pct = deliveryRate(status)
  const color = bandColor(pct)

  return (
    <div style={{
      background: 'var(--axon-surface)',
      border: '1px solid var(--axon-border)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 11, letterSpacing: 2.5, color: 'var(--axon-text-secondary)' }}>
          SIGNAL CONTINUITY
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--axon-text-dim)',
          padding: '2px 6px', background: 'var(--axon-surface-2)', border: '1px solid var(--axon-border)',
        }}>
          MQTT
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 34, height: 130,
            background: 'var(--axon-surface-2)',
            border: '1px solid var(--axon-border)',
            position: 'relative',
            display: 'flex', alignItems: 'flex-end',
          }}>
            <div style={{
              width: '100%', height: `${pct}%`,
              background: color,
              opacity: 0.85,
              transition: 'height .6s ease, background .6s ease',
            }} />
            {[25, 50, 75].map(m => (
              <div key={m} style={{
                position: 'absolute', left: 0, right: 0, bottom: `${m}%`,
                height: 1, background: 'rgba(255,255,255,0.08)',
              }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 34,
              lineHeight: 1, color, transition: 'color .4s',
            }}>{pct.toFixed(0)}<span style={{ fontSize: 16 }}>%</span></div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2,
              color: 'var(--axon-text-dim)', marginTop: 4,
            }}>BRIDGE HEALTH</div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1,
            color: 'var(--axon-text-faint)', marginTop: 6, lineHeight: 1.6,
          }}>
            PING {status.androidLastPing}s AGO<br />
            PUSH {status.serverLastPush}s AGO
          </div>
        </div>
      </div>
    </div>
  )
}
