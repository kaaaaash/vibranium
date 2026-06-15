import { useNavigate } from 'react-router-dom'
import './NotFound.css'

const S = {
  wrap:   { minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' },
  signal: { fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.3em', color: 'var(--danger)', marginBottom: '28px' },
  code:   { fontFamily: 'var(--font-hero)', fontSize: 'clamp(120px, 26vw, 300px)', lineHeight: 0.85, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '8px' },
  kicker: { fontFamily: 'var(--font-hero)', fontSize: 'clamp(24px, 4vw, 44px)', color: 'var(--accent)', marginBottom: '20px' },
  sub:    { fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.6, marginBottom: '44px' },
  btn:    { fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.18em', fontWeight: 700, color: 'var(--bg)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', padding: '18px 34px' },
}

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={S.wrap}>
      <p className="nf-flicker" style={S.signal}>● SIGNAL LOST</p>
      <h1 style={S.code}><span className="nf-glitch" data-text="404">404</span></h1>
      <p className="nf-up" style={S.kicker}>TRANSMISSION LOST.</p>
      <p className="nf-up" style={S.sub}>
        The coordinates you requested don't exist in this sector of the Vibranium grid.
        Re-establish the link and return to command.
      </p>
      <button className="nf-btn nf-up" style={S.btn} onClick={() => navigate('/')}>
        ← RETURN TO COMMAND
      </button>
    </div>
  )
}
