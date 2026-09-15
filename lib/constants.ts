import type { Scenario, ScenarioKey, RiskClass } from '@/types'

export const APP_NAME = 'AXON'
export const APP_TAGLINE = 'Adaptive eXtended-bridge Operational Network'
export const APP_SUBTITLE = 'Infrastructure Anomaly Detection System — Restricted Access'
export const APP_FOOTER = 'AXON v2.0 | Phase 1 Simulation | New Horizon College of Engineering'

export const AUTH_CREDENTIALS = {
  username: 'SaiSugeet',
  password: '2004',
}

export const SCENARIOS: Record<ScenarioKey, Scenario> = {
  NORMAL: {
    label: 'NORMAL',
    irmsMin: 5,
    irmsMax: 18,
    color: 'blue',
    desc: 'Baseline track condition. Sensor signatures within nominal envelope.',
    expectedRange: '0–25',
  },
  JOINT_FAULT: {
    label: 'JOINT FAULT',
    irmsMin: 22,
    irmsMax: 38,
    color: 'yellow',
    desc: 'Periodic impulses at joint interface. Monitor for fastener migration.',
    expectedRange: '20–40',
  },
  LOOSE_FASTENER: {
    label: 'LOOSE FASTENER',
    irmsMin: 15,
    irmsMax: 30,
    color: 'yellow',
    desc: 'Localised vertical oscillation. Inspection recommended within 72 hrs.',
    expectedRange: '15–32',
  },
  RAIL_CRACK: {
    label: 'RAIL CRACK',
    irmsMin: 38,
    irmsMax: 54,
    color: 'orange',
    desc: 'Sub-surface defect signature. Reduce operating speed in section.',
    expectedRange: '35–55',
  },
  SEVERE_DAMAGE: {
    label: 'SEVERE DAMAGE',
    irmsMin: 60,
    irmsMax: 92,
    color: 'red',
    desc: 'Multi-band vibration anomalies. Halt traffic, dispatch field crew.',
    expectedRange: '60–95',
  },
}

export const SCENARIO_ORDER: ScenarioKey[] = [
  'NORMAL',
  'JOINT_FAULT',
  'LOOSE_FASTENER',
  'RAIL_CRACK',
  'SEVERE_DAMAGE',
]

export const RISK_COLORS: Record<RiskClass, string> = {
  SAFE:     '#22C55E',
  MONITOR:  '#F59E0B',
  ALERT:    '#F97316',
  CRITICAL: '#EF4444',
}

export const RISK_RANGES: Record<RiskClass, string> = {
  SAFE:     '000 — 025',
  MONITOR:  '026 — 050',
  ALERT:    '051 — 075',
  CRITICAL: '076 — 100',
}

export const OBSTACLE_WEIGHTS: Record<ScenarioKey, Record<string, number>> = {
  NORMAL:         { CLEAR: 0.95, CATTLE: 0.02, PERSON: 0.02, DEBRIS: 0.01 },
  JOINT_FAULT:    { CLEAR: 0.90, CATTLE: 0.03, PERSON: 0.02, DEBRIS: 0.05 },
  LOOSE_FASTENER: { CLEAR: 0.90, CATTLE: 0.03, PERSON: 0.02, DEBRIS: 0.05 },
  RAIL_CRACK:     { CLEAR: 0.80, CATTLE: 0.08, PERSON: 0.05, DEBRIS: 0.07 },
  SEVERE_DAMAGE:  { CLEAR: 0.60, CATTLE: 0.15, PERSON: 0.15, DEBRIS: 0.10 },
}

/* Scenario accent color token -> hex, shared across sidebar/dial components */
export const SCENARIO_COLOR_HEX: Record<Scenario['color'], string> = {
  blue:   '#06B6D4',
  yellow: '#F59E0B',
  orange: '#F97316',
  red:    '#EF4444',
}
