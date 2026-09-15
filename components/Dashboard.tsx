'use client'

import { useSimulation } from '@/hooks/useSimulation'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import IRMSGauge from './IRMSGauge'
import SignalContinuity from './SignalContinuity'
import ActiveAlerts from './ActiveAlerts'
import IRMSTrendChart from './IRMSTrendChart'
import FFTSpectrumChart from './FFTSpectrumChart'
import ObstacleLog from './ObstacleLog'
import SystemTelemetry from './SystemTelemetry'

interface Props {
  operator: string
  onLogout: () => void
}

export default function Dashboard({ operator, onLogout }: Props) {
  const sim = useSimulation()

  return (
    <div className="dash-fade axon-root" style={{
      height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--axon-bg)',
    }}>
      <Navbar operator={operator} onLogout={onLogout} />

      <div className="axon-body" style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div className="axon-sidebar-wrap" style={{ display: 'flex' }}>
          <Sidebar
            scenario={sim.currentScenario}
            setScenario={sim.setScenario}
            riskClass={sim.riskClass}
            deviceStatus={sim.deviceStatus}
            obstacleLog={sim.obstacleLog}
          />
        </div>

        <div className="axon-main section-in" style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'minmax(220px,260px) 1fr minmax(220px,280px)',
          gap: 14,
          padding: 18,
        }}>
          <div className="axon-row-a" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 14, minHeight: 0 }}>
            <IRMSGauge value={sim.irmsScore} riskClass={sim.riskClass} />
            <SignalContinuity status={sim.deviceStatus} />
            <ActiveAlerts riskClass={sim.riskClass} />
          </div>

          <div className="axon-row-b" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, minHeight: 0 }}>
            <IRMSTrendChart history={sim.irmsHistory} />
            <FFTSpectrumChart fftData={sim.fftData} />
          </div>

          <div className="axon-row-c" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, minHeight: 0 }}>
            <ObstacleLog log={sim.obstacleLog} />
            <SystemTelemetry status={sim.deviceStatus} />
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .axon-root { overflow: hidden; }
        }
        @media (max-width: 1024px) {
          .axon-row-a { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 767px) {
          .axon-root { height: auto !important; min-height: 100vh; overflow: visible !important; }
          .axon-body { flex-direction: column !important; }
          .axon-sidebar-wrap { width: 100% !important; }
          .axon-sidebar-wrap > aside { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--axon-border) !important; }
          .axon-main { grid-template-rows: none !important; padding: 12px !important; gap: 12px !important; }
          .axon-row-a, .axon-row-b, .axon-row-c { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
