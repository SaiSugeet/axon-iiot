'use client'

import { RISK_RANGES } from '@/lib/constants'
import type { RiskClass } from '@/types'

interface Props { riskClass: RiskClass }

export default function ActiveAlerts({ riskClass }: Props) {
  const isCritical = riskClass === 'CRITICAL'

  return (
    <div style={{
      background: 'var(--axon-surface)',
      border: '1px solid var(--axon-border)',
      padding: 16,
      display: 'flex', flexDirection: 'column',
      height: '100%',
      minHeight: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 11, letterSpacing: 2.5, color: 'var(--axon-text-secondary)' }}>
          ACTIVE ALERTS
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--axon-text-dim)',
          padding: '2px 6px', background: 'var(--axon-surface-2)', border: '1px solid var(--axon-border)',
        }}>
          AUTO-GRADE
        </div>
      </div>

      <div
        className={`badge-${riskClass.toLowerCase()} ${isCritical ? 'critical-pulse-card' : ''}`}
        style={{
          flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 14,
          position: 'relative',
          textAlign: 'center',
          border: '1px solid',
          transition: 'all .3s',
        }}
      >
        {[
          { top: 6, left: 6, borderRight: 'none', borderBottom: 'none' },
          { top: 6, right: 6, borderLeft: 'none', borderBottom: 'none' },
          { bottom: 6, left: 6, borderRight: 'none', borderTop: 'none' },
          { bottom: 6, right: 6, borderLeft: 'none', borderTop: 'none' },
        ].map((style, i) => (
          <span key={i} style={{
            position: 'absolute',
            width: 12, height: 12,
            border: '2px solid currentColor',
            opacity: 0.5,
            ...style,
          }} />
        ))}

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700, fontSize: 38,
          letterSpacing: 4, lineHeight: 1,
        }}>{riskClass}</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5, letterSpacing: 2,
          marginTop: 12, opacity: 0.75,
        }}>IASI · {RISK_RANGES[riskClass]}</div>
      </div>
    </div>
  )
}
