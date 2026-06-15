import { useSearchParams, useNavigate } from 'react-router-dom'
import './DeploymentSuccess.css'

const teamLabel = (t) => t ? t.replace(/^team-/, '').toUpperCase() : 'DEFAULT'

const S = {
  wrap:    { minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px', position: 'relative', overflow: 'hidden' },
  ringWrap:{ position: 'relative', width: '120px', height: '120px', marginBottom: '52px' },
  burst:   { position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 },
  kicker:  { fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: '20px' },
  h1:      { fontFamily: 'var(--font-hero)', fontSize: 'clamp(52px, 9vw, 110px)', lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '12px', wordBreak: 'break-word' },
  sub:     { fontFamily: 'var(--font-hero)', fontSize: 'clamp(20px, 3vw, 30px)', color: 'var(--text-secondary)', marginBottom: '40px' },
  strip:   { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0', border: '1px solid var(--divider)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '48px' },
  cell:    { padding: '16px 28px', borderRight: '1px solid var(--divider)' },
  cellLast:{ padding: '16px 28px' },
  cellK:   { fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: '6px' },
  cellV:   { fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-primary)' },
  actions: { display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' },
  primary: { fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.16em', color: 'var(--bg)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', padding: '16px 30px' },
  ghost:   { fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.16em', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 30px' },
}

const burstItem = (i) => ({ position: 'absolute', transform: 'rotate(' + (i * 30) + 'deg)' })
const delay = (s) => ({ animationDelay: s + 's' })

export default function DeploymentSuccess() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const name = sp.get('name') || 'service'
  const namespace = sp.get('namespace') || 'default'

  return (
    <div style={S.wrap}>
      <div style={S.ringWrap}>
        <div style={S.burst}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={burstItem(i)}><span className="ss-particle" /></div>
          ))}
        </div>
        <div className="ss-ring">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <path className="ss-check" d="M16 29 L25 38 L41 19" />
          </svg>
        </div>
      </div>

      <p className="ss-up" style={Object.assign({}, S.kicker, delay(0.7))}>DEPLOYMENT SUCCESSFUL</p>
      <h1 className="ss-up" style={Object.assign({}, S.h1, delay(0.8))}>{name}</h1>
      <p className="ss-up" style={Object.assign({}, S.sub, delay(0.9))}>IS LIVE ON THE CLUSTER.</p>

      <div className="ss-up" style={Object.assign({}, S.strip, delay(1.0))}>
        <div style={S.cell}><p style={S.cellK}>DEPLOYMENT GROUP</p><p style={S.cellV}>{teamLabel(namespace)}</p></div>
        <div style={S.cell}><p style={S.cellK}>NAMESPACE</p><p style={S.cellV}>{namespace}</p></div>
        <div style={S.cellLast}><p style={S.cellK}>STRATEGY</p><p style={S.cellV}>Canary</p></div>
      </div>

      <div className="ss-up" style={Object.assign({}, S.actions, delay(1.1))}>
        <button className="ss-btn ss-primary" style={S.primary}
          onClick={() => navigate('/services/' + name + '?namespace=' + namespace)}>
          VIEW SERVICE →
        </button>
        <button className="ss-btn ss-ghost" style={S.ghost} onClick={() => navigate('/catalog')}>
          BACK TO CATALOG
        </button>
      </div>
    </div>
  )
}
