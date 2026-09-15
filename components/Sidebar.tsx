'use client'

import { useState, useEffect, useRef } from 'react'
import DeviceStatusStrip from './DeviceStatusStrip'
import ScenarioControl from './ScenarioControl'
import { SCENARIOS, SCENARIO_COLOR_HEX } from '@/lib/constants'
import type { ScenarioKey, RiskClass, DeviceStatus, ObstacleEvent } from '@/types'

interface Props {
  scenario: ScenarioKey
  setScenario: (s: ScenarioKey) => void
  riskClass: RiskClass
  deviceStatus: DeviceStatus
  obstacleLog: ObstacleEvent[]
}

function pad(n: number) { return String(n).padStart(2, '0') }
function nowStamp(): string {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

interface LogLine { id: number; time: string; text: string }
let _logId = 0

/**
 * UI-layer event log. Derived entirely from state already produced by
 * hooks/useSimulation.ts (scenario, riskClass, obstacleLog) — it does not
 * generate or alter any simulation data, it only narrates changes to it.
 */
function useSystemLog(scenario: ScenarioKey, riskClass: RiskClass, obstacleLog: ObstacleEvent[]) {
  const [lines, setLines] = useState<LogLine[]>([])
  const prevScenario = useRef<ScenarioKey | null>(null)
  const prevRisk = useRef<RiskClass | null>(null)
  const prevObstacleId = useRef<string | undefined>(undefined)

  const push = (text: string) => {
    setLines(l => [{ id: ++_logId, time: nowStamp(), text }, ...l].slice(0, 5))
  }

  useEffect(() => {
    if (prevScenario.current !== null && prevScenario.current !== scenario) {
      push(`SCENARIO -> ${SCENARIOS[scenario].label}`)
    }
    prevScenario.current = scenario
  }, [scenario])

  useEffect(() => {
    if (prevRisk.current !== null && prevRisk.current !== riskClass) {
      push(`RISK CLASS -> ${riskClass}`)
    }
    prevRisk.current = riskClass
  }, [riskClass])

  useEffect(() => {
    const top = obstacleLog[0]
    if (top && top.id !== prevObstacleId.current && top.obstacleClass !== 'CLEAR') {
      push(`OBSTACLE -> ${top.obstacleClass} (${(top.confidence * 100).toFixed(0)}%)`)
    }
    if (top) prevObstacleId.current = top.id
  }, [obstacleLog])

  return lines
}

export default function Sidebar({ scenario, setScenario, riskClass, deviceStatus, obstacleLog }: Props) {
  const [logOpen, setLogOpen] = useState(true)
  const logLines = useSystemLog(scenario, riskClass, obstacleLog)
  const activeColor = SCENARIO_COLOR_HEX[SCENARIOS[scenario].color]

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--axon-surface)',
      borderRight: '1px solid var(--axon-border)',
      padding: '18px 16px',
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 0,
      overflow: 'hidden',
    }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexShrink: 0 }}>
        <svg width="30" height="30" viewBox="0 0 32 32">
          <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="var(--axon-accent)" strokeWidth="1.6" />
          <polyline points="7,16 12,16 14,10 18,22 20,16 25,16" fill="none" stroke="var(--axon-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 17, letterSpacing: 3, color: 'var(--axon-text)' }}>AXON</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, letterSpacing: 1, color: 'var(--axon-text-faint)', marginTop: 1 }}>EDGE-AI IIOT</div>
        </div>
      </div>

      {/* Scroll area for status + scenario */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <DeviceStatusStrip status={deviceStatus} />

        <div>
          <div style={{
            fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 9.5,
            letterSpacing: 2, color: 'var(--axon-text-dim)', marginBottom: 4,
          }}>ACTIVE SCENARIO</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15,
            letterSpacing: 1.5, color: activeColor,
          }}>{SCENARIOS[scenario].label}</div>
        </div>

        <ScenarioControl scenario={scenario} setScenario={setScenario} />
      </div>

      {/* System log — pinned to bottom */}
      <div style={{ flexShrink: 0, marginTop: 14, borderTop: '1px solid var(--axon-border)', paddingTop: 12 }}>
        <button
          onClick={() => setLogOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: 'none', border: 'none', padding: 0,
            fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 9.5,
            letterSpacing: 2, color: 'var(--axon-text-dim)', cursor: 'pointer',
          }}
        >
          SYSTEM LOG
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{logOpen ? '−' : '+'}</span>
        </button>
        {logOpen && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 120, overflowY: 'auto' }}>
            {logLines.length === 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--axon-text-faint)' }}>
                AWAITING EVENTS…
              </div>
            )}
            {logLines.map(l => (
              <div key={l.id} style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, lineHeight: 1.5, color: 'var(--axon-text-dim)' }}>
                <span style={{ color: 'var(--axon-text-faint)' }}>[{l.time}]</span> {l.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
