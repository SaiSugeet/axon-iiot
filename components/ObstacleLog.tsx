'use client'

import { useRef, useEffect } from 'react'
import type { ObstacleEvent } from '@/types'

interface Props { log: ObstacleEvent[] }

function pad(n: number) { return String(n).padStart(2, '0') }
function fmtTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const CLS_COLOR: Record<string, string> = {
  CLEAR:  'var(--axon-text-dim)',
  CATTLE: 'var(--axon-monitor)',
  PERSON: 'var(--axon-critical)',
  DEBRIS: 'var(--axon-alert)',
}
const CLS_ROW_BG: Record<string, string> = {
  CATTLE: 'var(--axon-monitor-bg)',
  PERSON: 'var(--axon-critical-bg)',
  DEBRIS: 'var(--axon-alert-bg)',
}
const CLS_BORDER: Record<string, string> = {
  CATTLE: 'var(--axon-monitor)',
  PERSON: 'var(--axon-critical)',
  DEBRIS: 'var(--axon-alert)',
}

export default function ObstacleLog({ log }: Props) {
  const firstId = log[0]?.id
  const prevFirstId = useRef<string | undefined>(undefined)
  const flashRef = useRef<HTMLTableRowElement | null>(null)

  useEffect(() => {
    if (firstId && firstId !== prevFirstId.current && flashRef.current) {
      flashRef.current.classList.remove('row-flash')
      void flashRef.current.offsetWidth
      flashRef.current.classList.add('row-flash')
      prevFirstId.current = firstId
    }
  }, [firstId])

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
          OBSTACLE DETECTION EVENTS
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--axon-text-dim)',
          padding: '2px 6px', background: 'var(--axon-surface-2)', border: '1px solid var(--axon-border)',
        }}>
          YOLO-NANO · EDGE
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--axon-surface-3)', position: 'sticky', top: 0 }}>
              {['TIME', 'CLASS', 'CONFIDENCE', 'STATUS'].map((h, i) => (
                <th key={h} style={{
                  textAlign: 'left', fontWeight: 600,
                  letterSpacing: 2, color: 'var(--axon-text-secondary)',
                  padding: '7px 10px',
                  borderBottom: '1px solid var(--axon-border)',
                  fontSize: 9.5,
                  fontFamily: 'var(--font-inter)',
                  width: i === 0 ? 80 : i === 3 ? 70 : undefined,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {log.map((row, i) => {
              const isEvent = row.obstacleClass !== 'CLEAR'
              const confPct = (row.confidence * 100).toFixed(1)
              const confBarColor = isEvent ? CLS_BORDER[row.obstacleClass] ?? 'var(--axon-alert)' : 'var(--axon-accent)'
              const rowBg = isEvent ? CLS_ROW_BG[row.obstacleClass] ?? 'var(--axon-alert-bg)' : 'transparent'
              const rowBorderLeft = isEvent ? `3px solid ${CLS_BORDER[row.obstacleClass] ?? 'var(--axon-alert)'}` : '3px solid transparent'

              return (
                <tr
                  key={row.id}
                  ref={i === 0 ? flashRef : undefined}
                  style={{ background: rowBg, borderLeft: rowBorderLeft }}
                >
                  <td style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--axon-border)',
                    color: 'var(--axon-text-dim)',
                  }}>{fmtTime(row.timestamp)}</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--axon-border)' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 7px',
                      fontSize: 10, letterSpacing: 1.5,
                      fontWeight: isEvent ? 600 : 400,
                      color: CLS_COLOR[row.obstacleClass],
                    }}>{row.obstacleClass}</span>
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--axon-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        flex: 1, height: 4,
                        background: 'var(--axon-surface-2)',
                        position: 'relative', minWidth: 50, maxWidth: 80,
                      }}>
                        <div style={{
                          position: 'absolute', left: 0, top: 0, bottom: 0,
                          width: confPct + '%', background: confBarColor,
                        }} />
                      </div>
                      <span style={{ color: 'var(--axon-text-dim)', fontSize: 10 }}>{confPct}%</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--axon-border)',
                    color: isEvent ? CLS_BORDER[row.obstacleClass] ?? 'var(--axon-alert)' : 'var(--axon-text-dim)',
                    fontWeight: isEvent ? 600 : 400,
                  }}>{isEvent ? 'FLAG' : 'OK'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
