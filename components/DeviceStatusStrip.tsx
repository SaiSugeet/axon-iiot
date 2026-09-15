'use client'

import type { DeviceStatus } from '@/types'
import { formatUptime } from '@/hooks/useSimulation'

interface Props { status: DeviceStatus }

function Row({ online, name, meta }: { online: boolean; name: string; meta: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 9,
      padding: '9px 0',
      borderBottom: '1px solid var(--axon-border)',
    }}>
      <span className={online ? 'status-dot' : 'status-dot-offline'} style={{ marginTop: 4 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 10.5,
          letterSpacing: 1.2, color: 'var(--axon-text)',
        }}>{name}</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9.5,
          letterSpacing: 0.5, color: 'var(--axon-text-dim)', marginTop: 2,
        }}>{meta}</div>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: 1,
        color: online ? 'var(--axon-safe)' : 'var(--axon-critical)',
        marginTop: 3,
      }}>{online ? 'OK' : 'DOWN'}</div>
    </div>
  )
}

export default function DeviceStatusStrip({ status }: Props) {
  const androidOnline = status.androidMqttConnected
  const serverOnline = status.serverMlRunning && status.serverApiActive

  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 9.5,
        letterSpacing: 2, color: 'var(--axon-text-dim)', marginBottom: 2,
      }}>SYSTEM STATUS</div>
      <Row online={true} name="PI ZERO 2W" meta={`${status.piPacketCount.toLocaleString()} PKT · ${formatUptime(status.piUptime)}`} />
      <Row online={androidOnline} name="ANDROID BRIDGE" meta={`BUF ${status.androidBuffer} · PING ${status.androidLastPing}s`} />
      <Row online={serverOnline} name="CENTRAL SERVER" meta={`ML RUNNING · PUSH ${status.serverLastPush}s`} />
    </div>
  )
}
