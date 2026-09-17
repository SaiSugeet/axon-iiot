'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  ScenarioKey, RiskClass, FFTBin, ObstacleEvent,
  SimulationState, DeviceStatus, SystemStats,
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const SCENARIO_KEYS: ScenarioKey[] = ['NORMAL', 'JOINT_FAULT', 'LOOSE_FASTENER', 'RAIL_CRACK', 'SEVERE_DAMAGE']
const RISK_CLASSES: RiskClass[] = ['SAFE', 'MONITOR', 'ALERT', 'CRITICAL']

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function toScenarioKey(v: unknown, fallback: ScenarioKey): ScenarioKey {
  return typeof v === 'string' && (SCENARIO_KEYS as string[]).includes(v) ? (v as ScenarioKey) : fallback
}

function toRiskClass(v: unknown, fallback: RiskClass): RiskClass {
  return typeof v === 'string' && (RISK_CLASSES as string[]).includes(v) ? (v as RiskClass) : fallback
}

interface IasiReading {
  iasi_score?: number
  classification?: string
  scenario?: string
  vibration_score?: number
  signal_continuity?: number
  dominant_freq?: number
}

interface FFTLatest {
  dominant_freq?: number
  peak_power?: number
}

interface SystemStatusResp {
  packet_count?: number
  signal_continuity?: number
  server_uptime?: number
}

async function fetchJson<T>(path: string, timeoutMs = 4000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: ctrl.signal, cache: 'no-store' })
    if (!res.ok) throw new Error(`${path} responded ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

// The Flask API only exposes 7 scalar FFT features, not a full spectrum —
// reconstruct a bell-curve spectrum around the real dominant frequency/power
// so FFTSpectrumChart (which expects 51 FFTBin points) renders unchanged.
function buildFFTBins(dominantFreq: number, peakPower: number): FFTBin[] {
  const bins = 51
  const center = clamp(Math.round(dominantFreq), 0, bins - 1)
  const height = clamp(peakPower, 5, 100)
  const width = 6
  const out: FFTBin[] = []
  for (let i = 0; i < bins; i++) {
    const d = (i - center) / width
    const base = height * Math.exp(-d * d)
    const floor = 4 + Math.random() * 6
    out.push({ frequency: i, power: clamp(base + floor, 0, 100) })
  }
  return out
}

export interface RealDataState extends SimulationState {
  isConnected: boolean
  statusLabel: string
}

export function useRealData(): RealDataState {
  const [isConnected, setIsConnected] = useState(false)

  const [currentScenario, setCurrentScenario] = useState<ScenarioKey>('NORMAL')
  const [irmsScore, setIrmsScore] = useState(0)
  const [irmsHistory, setIrmsHistory] = useState<number[]>([])
  const [riskClass, setRiskClass] = useState<RiskClass>('SAFE')
  const [fftData, setFftData] = useState<FFTBin[]>(() => buildFFTBins(5, 20))

  // No obstacle-detection endpoint exists on the Flask API yet — keep the
  // shape SimulationState expects, populated once that endpoint ships.
  const [obstacleLog] = useState<ObstacleEvent[]>([])

  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    piPacketCount: 0,
    piUptime: 0,
    androidMqttConnected: false,
    androidBuffer: 'UNKNOWN',
    androidLastPing: 0,
    serverMlRunning: false,
    serverApiActive: false,
    serverLastPush: 0,
  })

  const [systemStats, setSystemStats] = useState<SystemStats>({
    packetsProcessed: 0,
    scenarioUptime: 0,
    apiResponse: 0,
    modelConfidence: 0,
    vibrationComponent: 0,
    obstacleComponent: 0,
    communicationComponent: 0,
  })

  const lastLatestOkRef = useRef<number>(0)
  const lastStatusOkRef = useRef<number>(0)
  const scnStartRef = useRef<number>(Date.now())

  // Scenario is dictated by the live sensor pipeline (MQTT -> ML), not the
  // operator, so the dashboard's scenario picker is inert in live mode.
  const setScenario = useCallback((_scenario: ScenarioKey) => {}, [])

  // 2 s — IASI latest: score, classification, scenario, vibration/comm components.
  useEffect(() => {
    let alive = true
    const poll = async () => {
      const started = Date.now()
      try {
        const data = await fetchJson<IasiReading>('/api/iasi/latest')
        if (!alive) return
        lastLatestOkRef.current = Date.now()
        setIsConnected(true)

        const score = clamp(data.iasi_score ?? 0, 0, 100)
        setIrmsScore(score)
        setRiskClass(prev => toRiskClass(data.classification, prev))
        setCurrentScenario(prev => {
          const next = toScenarioKey(data.scenario, prev)
          if (next !== prev) scnStartRef.current = Date.now()
          return next
        })

        setSystemStats(s => ({
          ...s,
          vibrationComponent: clamp((data.vibration_score ?? 0) * 100, 0, 100),
          communicationComponent: clamp((data.signal_continuity ?? 0) * 100, 0, 100),
          apiResponse: Date.now() - started,
        }))
      } catch {
        if (!alive) return
        setIsConnected(false)
      }
    }
    poll()
    const timer = setInterval(poll, 2000)
    return () => { alive = false; clearInterval(timer) }
  }, [])

  // 5 s — IASI history: repopulate the trend chart from the server's window.
  useEffect(() => {
    let alive = true
    const poll = async () => {
      try {
        const rows = await fetchJson<IasiReading[]>('/api/iasi/history')
        if (!alive || !rows.length) return
        setIrmsHistory(rows.map(r => clamp(r.iasi_score ?? 0, 0, 100)))
      } catch {
        // keep last known history on failure
      }
    }
    poll()
    const timer = setInterval(poll, 5000)
    return () => { alive = false; clearInterval(timer) }
  }, [])

  // 5 s — FFT latest: rebuild the spectrum around the real dominant frequency.
  useEffect(() => {
    let alive = true
    const poll = async () => {
      try {
        const data = await fetchJson<FFTLatest>('/api/fft/latest')
        if (!alive) return
        setFftData(buildFFTBins(data.dominant_freq ?? 0, data.peak_power ?? 20))
      } catch {
        // keep last known spectrum on failure
      }
    }
    poll()
    const timer = setInterval(poll, 5000)
    return () => { alive = false; clearInterval(timer) }
  }, [])

  // 10 s — system status: packet counts, uptime, communication health.
  useEffect(() => {
    let alive = true
    const poll = async () => {
      try {
        const data = await fetchJson<SystemStatusResp>('/api/system/status')
        if (!alive) return
        lastStatusOkRef.current = Date.now()

        setSystemStats(s => ({
          ...s,
          packetsProcessed: data.packet_count ?? s.packetsProcessed,
          scenarioUptime: Math.floor((Date.now() - scnStartRef.current) / 1000),
          communicationComponent: data.signal_continuity != null
            ? clamp(data.signal_continuity * 100, 0, 100)
            : s.communicationComponent,
        }))
        setDeviceStatus(d => ({
          ...d,
          piPacketCount: data.packet_count ?? d.piPacketCount,
          piUptime: Math.floor(data.server_uptime ?? d.piUptime),
          androidMqttConnected: true,
          androidBuffer: 'HEALTHY',
          serverMlRunning: true,
          serverApiActive: true,
        }))
      } catch {
        if (!alive) return
        setDeviceStatus(d => ({
          ...d,
          androidMqttConnected: false,
          androidBuffer: 'DEGRADED',
          serverMlRunning: false,
          serverApiActive: false,
        }))
      }
    }
    poll()
    const timer = setInterval(poll, 10000)
    return () => { alive = false; clearInterval(timer) }
  }, [])

  // 1 Hz — derive "Xs ago" ping/push readouts from last successful contact.
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      setDeviceStatus(d => ({
        ...d,
        androidLastPing: lastLatestOkRef.current ? Math.floor((now - lastLatestOkRef.current) / 1000) : d.androidLastPing,
        serverLastPush: lastStatusOkRef.current ? Math.floor((now - lastStatusOkRef.current) / 1000) : d.serverLastPush,
      }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return {
    currentScenario, irmsScore, irmsHistory, riskClass,
    fftData, obstacleLog, deviceStatus, systemStats, setScenario,
    isConnected,
    statusLabel: isConnected ? 'LIVE' : 'LIVE DATA — RECONNECTING',
  }
}
