'use client'

import { SCENARIOS, SCENARIO_ORDER } from '@/lib/constants'
import type { ScenarioKey } from '@/types'

interface Props {
  scenario: ScenarioKey
  setScenario: (s: ScenarioKey) => void
}

const ACTIVE_CLASS: Record<string, string> = {
  blue:   'sw-active-blue',
  yellow: 'sw-active-yellow',
  orange: 'sw-active-orange',
  red:    'sw-active-red',
}

export default function ScenarioControl({ scenario, setScenario }: Props) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 9.5,
        letterSpacing: 2, color: 'var(--axon-text-dim)', marginBottom: 8,
      }}>TRACK SCENARIO CONTROL</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SCENARIO_ORDER.map(key => {
          const s = SCENARIOS[key]
          const isActive = scenario === key
          return (
            <button
              key={key}
              className={isActive ? ACTIVE_CLASS[s.color] : ''}
              onClick={() => setScenario(key)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--axon-surface-2)',
                border: '1px solid var(--axon-border)',
                padding: '9px 12px',
                fontFamily: 'var(--font-inter)',
                fontWeight: 600, fontSize: 10.5,
                letterSpacing: 1.5,
                cursor: 'pointer',
                transition: 'all .18s',
                color: 'var(--axon-text-secondary)',
                width: '100%',
              }}
            >
              <span>{s.label}</span>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isActive ? 'currentColor' : 'var(--axon-border-strong)',
                boxShadow: isActive ? '0 0 6px currentColor' : 'none',
                flexShrink: 0,
                transition: 'all .18s',
              }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
