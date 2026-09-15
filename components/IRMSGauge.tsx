'use client'

import { RISK_COLORS, RISK_RANGES } from '@/lib/constants'
import type { RiskClass } from '@/types'

interface Props { value: number; riskClass: RiskClass }

export default function IRMSGauge({ value, riskClass }: Props) {
  const size = 220
  const cx = size / 2
  const cy = size * 0.62
  const r  = 80

  const startA = Math.PI
  const endA   = 2 * Math.PI

  const arc = (frac: number): [number, number] => {
    const a = startA + (endA - startA) * frac
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }

  const segPath = (f0: number, f1: number) => {
    const [x0, y0] = arc(f0)
    const [x1, y1] = arc(f1)
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`
  }

  const v     = Math.max(0, Math.min(100, value))
  const frac  = v / 100
  const color = RISK_COLORS[riskClass]

  const [needleX, needleY] = arc(frac)

  const tickAt = (f: number) => {
    const a = startA + (endA - startA) * f
    return {
      x1: cx + (r - 4) * Math.cos(a), y1: cy + (r - 4) * Math.sin(a),
      x2: cx + (r + 7) * Math.cos(a), y2: cy + (r + 7) * Math.sin(a),
    }
  }

  const segments = [
    { from: 0,    to: 0.25, color: RISK_COLORS.SAFE },
    { from: 0.25, to: 0.50, color: RISK_COLORS.MONITOR },
    { from: 0.50, to: 0.75, color: RISK_COLORS.ALERT },
    { from: 0.75, to: 1.00, color: RISK_COLORS.CRITICAL },
  ]

  const svgH = size * 0.76

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
          IASI GAUGE
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--axon-text-dim)',
          padding: '2px 6px', background: 'var(--axon-surface-2)', border: '1px solid var(--axon-border)',
        }}>
          REAL-TIME
        </div>
      </div>

      <div style={{
        background: 'var(--axon-surface-2)',
        border: '1px solid var(--axon-border)',
        padding: '10px 16px',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 42, lineHeight: 1,
          letterSpacing: -1, color, transition: 'color .4s',
        }}>{v.toFixed(1)}</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2,
          color: 'var(--axon-text-dim)', marginTop: 4,
        }}>IASI · INFRASTRUCTURE ANOMALY SEVERITY INDEX</div>
        <div
          className={`badge-${riskClass.toLowerCase()}`}
          style={{
            display: 'inline-block', marginTop: 8,
            border: '1px solid', padding: '3px 12px',
            fontFamily: 'var(--font-inter)', fontWeight: 700,
            fontSize: 12, letterSpacing: 3,
          }}
        >{riskClass}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', flex: 1, minHeight: 0 }}>
        <svg
          viewBox={`0 0 ${size} ${svgH}`}
          style={{ display: 'block', width: '100%', maxWidth: size, height: 'auto' }}
        >
          <path
            d={`M ${arc(0)[0]} ${arc(0)[1]} A ${r} ${r} 0 0 1 ${arc(1)[0]} ${arc(1)[1]}`}
            stroke="#1C2432" strokeWidth="13" fill="none" strokeLinecap="butt"
          />
          {segments.map((s, i) => (
            <path
              key={i}
              d={segPath(s.from, s.to)}
              stroke={s.color} strokeWidth="13" fill="none"
              opacity={frac >= s.from ? 0.95 : 0.18}
              style={{ transition: 'opacity .4s' }}
            />
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const t = tickAt(f)
            return <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--axon-text-dim)" strokeWidth="1.2" />
          })}
          {[0, 25, 50, 75, 100].map((n, i) => {
            const a = startA + (endA - startA) * (n / 100)
            const lr = r + 20
            return (
              <text key={i} x={cx + lr * Math.cos(a)} y={cy + lr * Math.sin(a)}
                fontFamily="var(--font-mono)" fontSize="9.5"
                fill="var(--axon-text-dim)" textAnchor="middle" dominantBaseline="middle">
                {n}
              </text>
            )
          })}
          <g style={{ transition: 'all .6s cubic-bezier(.5,.1,.3,1)' }}>
            <line x1={cx} y1={cy} x2={needleX} y2={needleY}
              stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="6" fill={color} />
            <circle cx={cx} cy={cy} r="2.5" fill="var(--axon-surface)" />
          </g>
        </svg>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1,
        color: 'var(--axon-text-faint)', textAlign: 'center', marginTop: 4,
      }}>RANGE · {RISK_RANGES[riskClass]}</div>
    </div>
  )
}
