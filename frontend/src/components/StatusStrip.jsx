import './StatusStrip.css'

// Mock metrics for now — wire to real cluster counters when EKS is back up.
const STATS = [
  { label: 'CLUSTER', value: 'ONLINE', live: true, accent: true },
  { label: 'SERVICES', value: '24' },
  { label: 'DEPLOYMENTS', value: '1,287' },
  { label: 'SUCCESS RATE', value: '99.98%' },
]

export default function StatusStrip() {
  return (
    <div className="vib-status">
      {STATS.map((s) => (
        <div className="vib-status-item" key={s.label}>
          <span className="vib-status-label">{s.label}</span>
          <span className={s.accent ? 'vib-status-value accent' : 'vib-status-value'}>
            {s.live ? <span className="vib-dot" /> : null}
            {s.value}
          </span>
        </div>
      ))}
    </div>
  )
}