'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import type { FFTBin } from '@/types'

interface Props { fftData: FFTBin[] }

function barColor(power: number): string {
  if (power <= 55) return '#06B6D4'
  if (power <= 75) return '#F59E0B'
  return '#EF4444'
}

export default function FFTSpectrumChart({ fftData }: Props) {
  const domIdx = fftData.reduce((best, b, i) => b.power > fftData[best].power ? i : best, 0)
  const domBin = fftData[domIdx]

  return (
    <div style={{
      background: 'var(--axon-surface)',
      border: '1px solid var(--axon-border)',
      padding: 16,
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 11, letterSpacing: 2.5, color: 'var(--axon-text-secondary)' }}>
          VIBRATION FREQUENCY ANALYSIS
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--axon-text-dim)',
          padding: '2px 6px', background: 'var(--axon-surface-2)', border: '1px solid var(--axon-border)',
        }}>
          0.2 HZ · UPDATE
        </div>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1,
        color: 'var(--axon-text-secondary)', marginBottom: 6,
      }}>
        DOMINANT FREQUENCY:{' '}
        <strong style={{ color: 'var(--axon-accent)', fontWeight: 600 }}>{domBin?.frequency ?? 0} Hz</strong>
        {' '}· POWER {domBin?.power.toFixed(1) ?? '0.0'}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fftData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="10%">
            <XAxis
              dataKey="frequency"
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--axon-text-dim)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--axon-border)' }}
              tickFormatter={(v) => [0, 10, 20, 30, 40, 50].includes(v) ? `${v}Hz` : ''}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--axon-text-dim)' }}
              tickLine={false}
              axisLine={false}
              width={26}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--axon-surface-2)',
                border: '1px solid var(--axon-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--axon-text)',
              }}
              formatter={(v: number) => [v.toFixed(1), 'Power']}
              labelFormatter={(l: number) => `${l} Hz`}
            />
            <Bar dataKey="power" isAnimationActive={false}>
              {fftData.map((entry, index) => (
                <Cell key={index} fill={barColor(entry.power)} opacity={index === domIdx ? 1 : 0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
