'use client'

import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts'

interface Props { history: number[] }

const ZONES = [
  { key: 'safe',     max: 25,  color: '#22C55E' },
  { key: 'monitor',  max: 50,  color: '#F59E0B' },
  { key: 'alert',    max: 75,  color: '#F97316' },
  { key: 'critical', max: 101, color: '#EF4444' },
]

function zoneOf(v: number): number {
  return ZONES.findIndex(z => v <= z.max)
}

export default function IRMSTrendChart({ history }: Props) {
  const maxN = 60
  const raw = history.slice(-maxN)
  const data = raw.map((v, i) => ({ i, v }))
  const latest = data[data.length - 1]?.v ?? 0
  const mean = data.length ? data.reduce((a, b) => a + b.v, 0) / data.length : 0
  const zoneIdx = zoneOf(latest)
  const lineColor = ZONES[zoneIdx]?.color ?? ZONES[0].color

  // Build one series per zone — each includes a "bridge" point at the
  // previous index when the previous reading belonged to a different zone,
  // so adjacent colored segments visually connect at the crossover.
  const zoneSeries = ZONES.map((_, zIdx) =>
    raw.map((v, i) => {
      const belongs = zoneOf(v) === zIdx
      const prevBelongs = i > 0 && zoneOf(raw[i - 1]) === zIdx
      return belongs || prevBelongs ? v : null
    })
  )

  const chartData = raw.map((_, i) => {
    const row: Record<string, number | null> = { i }
    ZONES.forEach((z, zIdx) => { row[z.key] = zoneSeries[zIdx][i] })
    return row
  })

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
          IASI TREND — LAST 60 READINGS
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--axon-text-dim)',
          padding: '2px 6px', background: 'var(--axon-surface-2)', border: '1px solid var(--axon-border)',
        }}>
          1 HZ · LIVE
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 4 }}>
            <XAxis
              dataKey="i"
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--axon-text-dim)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--axon-border)' }}
              tickFormatter={(v) => {
                const offset = v - (maxN - 1)
                if (offset === -(maxN - 1)) return '-60s'
                if (offset === -Math.floor((maxN - 1) / 2)) return '-30s'
                if (offset === 0) return 'NOW'
                return ''
              }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--axon-text-dim)' }}
              tickLine={false}
              axisLine={false}
              width={26}
            />
            <ReferenceLine y={25} stroke="var(--axon-border-strong)" strokeDasharray="3 4" />
            <ReferenceLine y={50} stroke="var(--axon-border-strong)" strokeDasharray="3 4" />
            <ReferenceLine y={75} stroke="var(--axon-border-strong)" strokeDasharray="3 4" />
            <Tooltip
              contentStyle={{
                background: 'var(--axon-surface-2)',
                border: '1px solid var(--axon-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--axon-text)',
              }}
              formatter={(v: number) => [v.toFixed(1), 'IASI']}
              labelFormatter={() => ''}
            />
            {ZONES.map(z => (
              <Line
                key={z.key}
                type="monotone" dataKey={z.key}
                stroke={z.color} strokeWidth={1.8}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1,
        color: 'var(--axon-text-dim)', marginTop: 4,
      }}>
        CURRENT:{' '}
        <strong style={{ color: lineColor, fontWeight: 600 }}>{latest.toFixed(1)}</strong>
        {' '}· WINDOW MEAN: {mean.toFixed(1)}
      </div>
    </div>
  )
}
