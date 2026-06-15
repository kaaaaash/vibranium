import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Deploy.css'
import { apiPost } from '../lib/api'
import MagneticButton from '../components/MagneticButton' 

const TEAMS = [
  { label: 'PAYMENTS', value: 'team-payments' },
  { label: 'AUTH',     value: 'team-auth' },
  { label: 'GATEWAY',  value: 'team-gateway' },
  { label: 'INFRA',    value: 'team-infra' },
]

const FIELD_BG = 'rgba(255,255,255,0.03)'
const FIELD_BORDER = 'rgba(255,255,255,0.12)'

const S = {
  page:    { maxWidth: '760px', margin: '0 auto', padding: '72px 32px 140px' },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' },
  kicker:  { fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.22em', color: 'var(--text-muted)' },
  live:    { fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--success)', border: '1px solid var(--divider)', borderRadius: '999px', padding: '6px 14px', background: 'rgba(76,175,130,0.08)' },
  h1:      { fontFamily: 'var(--font-hero)', fontSize: 'clamp(56px, 9vw, 120px)', lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '24px' },
  bridge:  { fontFamily: 'var(--font-nav)', fontSize: '13px', letterSpacing: '0.32em', color: 'var(--accent)', marginBottom: '56px' },
  metaStrip:{ display: 'flex', flexWrap: 'wrap', gap: '44px', padding: '24px 0', borderTop: '1px solid ' + FIELD_BORDER, borderBottom: '1px solid ' + FIELD_BORDER, marginBottom: '72px' },
  metaItem:{ display: 'flex', flexDirection: 'column', gap: '7px' },
  metaLabel:{ fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--text-muted)' },
  metaValue:{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' },
  metaAccent:{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 500, color: 'var(--success)' },
  form:    { display: 'flex', flexDirection: 'column', gap: '32px' },
  label:   { fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' },
  field:   { width: '100%', background: FIELD_BG, border: '1px solid ' + FIELD_BORDER, color: '#FBF9F6', fontWeight: 500, fontFamily: 'var(--font-body)', fontSize: '20px', padding: '18px 20px', borderRadius: 'var(--radius)', outline: 'none', transition: 'border-color 0.15s ease' },
  fieldSm: { width: '100%', background: FIELD_BG, border: '1px solid ' + FIELD_BORDER, color: '#FBF9F6', fontWeight: 500, fontFamily: 'var(--font-body)', fontSize: '15px', padding: '16px 18px', borderRadius: 'var(--radius)', outline: 'none', transition: 'border-color 0.15s ease' },
  option:  { background: 'var(--bg-elevated)', color: 'var(--text-primary)' },
  rangeVal:{ fontFamily: 'var(--font-hero)', fontSize: '32px', color: 'var(--accent)', marginLeft: '8px' },
  envWrap: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' },
  envRow:  { display: 'flex', gap: '12px', alignItems: 'center' },
  envDel:  { background: 'transparent', border: '1px solid ' + FIELD_BORDER, color: 'var(--text-muted)', borderRadius: 'var(--radius)', padding: '16px 18px', cursor: 'pointer' },
  envAdd:  { background: 'transparent', border: 'none', color: 'var(--accent)', fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.16em', cursor: 'pointer', padding: 0 },
  stratHead:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' },
  stratWord:{ fontFamily: 'var(--font-hero)', fontSize: 'clamp(40px, 7vw, 72px)', lineHeight: 0.9, letterSpacing: '-0.01em' },
  stratSteps:{ fontFamily: 'var(--font-nav)', fontSize: '18px', letterSpacing: '0.14em', color: 'var(--text-secondary)', marginTop: '16px' },
  knob:    { width: '22px', height: '22px', borderRadius: '50%', background: 'var(--bg)' },
  error:   { marginTop: '32px', fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.1em', color: 'var(--danger)' },
}

function Meta({ label, value, accent }) {
  return (
    <div style={S.metaItem}>
      <span style={S.metaLabel}>{label}</span>
      <span style={accent ? S.metaAccent : S.metaValue}>{value}</span>
    </div>
  )
}

export default function Deploy() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', team: 'team-payments', image: '', port: '8000', replicas: 2 })
  const [canary, setCanary] = useState(true)
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }])
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => Object.assign({}, f, { [k]: v }))
  const setEnv = (i, field, v) => setEnvVars(rows => rows.map((r, idx) => idx === i ? Object.assign({}, r, { [field]: v }) : r))
  const addEnv = () => setEnvVars(rows => rows.concat([{ key: '', value: '' }]))
  const removeEnv = (i) => setEnvVars(rows => rows.filter((_, idx) => idx !== i))
  const sanitizeName = (v) => v.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  const fillPct = ((Number(form.replicas) - 1) / 4) * 100
  const rangeStyle = { background: 'linear-gradient(to right, var(--accent) ' + fillPct + '%, rgba(255,255,255,0.12) ' + fillPct + '%)' }

  const stratPanel = {
    padding: '40px', borderRadius: 'var(--radius)', cursor: 'pointer',
    border: '1px solid ' + (canary ? 'var(--accent)' : FIELD_BORDER),
    background: canary ? 'rgba(230,210,162,0.06)' : FIELD_BG,
    transition: 'all 0.2s ease',
  }
  const switchTrack = {
    width: '52px', height: '28px', borderRadius: '14px', padding: '3px', flexShrink: 0,
    background: canary ? 'var(--accent)' : FIELD_BORDER,
    display: 'flex', justifyContent: canary ? 'flex-end' : 'flex-start',
    transition: 'all 0.15s ease',
  }
  const cta = {
    marginTop: '56px', width: '100%', padding: '30px',
    background: 'var(--accent)', color: 'var(--bg)', border: 'none',
    borderRadius: 'var(--radius)', cursor: deploying ? 'wait' : 'pointer',
    fontFamily: 'var(--font-nav)', fontSize: '16px', fontWeight: 700,
    letterSpacing: '0.24em', transition: 'all 0.18s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
  }
  const ctaIn = (e) => { if (!deploying) { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' } }
  const ctaOut = (e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)' }

  const handleDeploy = async () => {
    setError(null)
    if (!form.name || !form.image) { setError('SERVICE IDENTIFIER AND CONTAINER IMAGE ARE REQUIRED.'); return }
    setDeploying(true)
    try {
      const env = Object.fromEntries(envVars.filter(r => r.key.trim()).map(r => [r.key.trim(), r.value]))
await apiPost('/services', {
  name: form.name,
  team: form.team,
  image: form.image,
  port: Number(form.port) || 8000,
  replicas: Number(form.replicas) || 2,
  canary,
  env,
})
navigate('/deployed?name=' + encodeURIComponent(form.name) + '&namespace=' + encodeURIComponent(form.team))
    } catch (e) {
      setError('DEPLOY FAILED. ' + (e.message || '').toUpperCase())
      setDeploying(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <p style={S.kicker}>VIBRANIUM / DEPLOY</p>
        <span style={S.live}>● SHADOW ENGINE ONLINE</span>
      </div>
      <h1 style={S.h1}>DEPLOY.</h1>
      <p style={S.bridge}>DEFINE. CONFIGURE. RELEASE.</p>
      <div style={S.metaStrip}>
        <Meta label="TARGET CLUSTER" value="vibranium-cluster" />
        <Meta label="REGION" value="ap-south-1" />
        <Meta label="DEPLOY ENGINE" value="SHADOW" />
        <Meta label="STATUS" value="● OPERATIONAL" accent />
      </div>
      <div style={S.form}>
        <div>
          <label style={S.label}>SERVICE IDENTIFIER</label>
          <input className="vib-field" value={form.name} placeholder="payment-service"
            onChange={e => set('name', sanitizeName(e.target.value))} style={S.field} />
        </div>
        <div>
          <label style={S.label}>DEPLOYMENT GROUP</label>
          <select className="vib-field" value={form.team} onChange={e => set('team', e.target.value)} style={S.field}>
            {TEAMS.map(t => (
              <option key={t.value} value={t.value} style={S.option}>{t.label} — {t.value}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>CONTAINER IMAGE</label>
          <input className="vib-field" value={form.image} placeholder="974066991644.dkr.ecr.ap-south-1.amazonaws.com/vibranium-test:latest"
            onChange={e => set('image', e.target.value)} style={S.fieldSm} />
        </div>
        <div>
          <label style={S.label}>EXPOSED PORT</label>
          <input className="vib-field" type="number" value={form.port} placeholder="8000"
            onChange={e => set('port', e.target.value)} style={S.field} />
        </div>
        <div>
          <label style={S.label}>REPLICA COUNT<span style={S.rangeVal}>{form.replicas}</span></label>
          <input className="vib-range" type="range" min="1" max="5" step="1" value={form.replicas}
            onChange={e => set('replicas', Number(e.target.value))} style={rangeStyle} />
        </div>
        <div>
          <label style={S.label}>ENVIRONMENT VARIABLES</label>
          <div style={S.envWrap}>
            {envVars.map((row, i) => (
              <div key={i} style={S.envRow}>
                <input className="vib-field" value={row.key} placeholder="KEY"
                  onChange={e => setEnv(i, 'key', e.target.value)} style={S.fieldSm} />
                <input className="vib-field" value={row.value} placeholder="value"
                  onChange={e => setEnv(i, 'value', e.target.value)} style={S.fieldSm} />
                <button onClick={() => removeEnv(i)} style={S.envDel}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addEnv} style={S.envAdd}>+ ADD VARIABLE</button>
        </div>
        <div>
          <label style={S.label}>ROLLOUT STRATEGY</label>
          <div onClick={() => setCanary(c => !c)} style={stratPanel}>
            <div style={S.stratHead}>
              <span style={S.label}>{canary ? 'PROGRESSIVE DELIVERY — ENABLED' : 'DIRECT ROLLOUT'}</span>
              <div style={switchTrack}><div style={S.knob} /></div>
            </div>
            <p style={S.stratWord}>{canary ? 'SHADOW.' : 'STANDARD.'}</p>
            <p style={S.stratSteps}>{canary ? '20 → 40 → 60 → 80 → 100' : 'SINGLE-STEP — NO CANARY ANALYSIS'}</p>
          </div>
        </div>
      </div>
      {error && <p style={S.error}>{error}</p>}
      <MagneticButton onClick={handleDeploy} disabled={deploying} baseStyle={cta}>
        {deploying ? 'DEPLOYING...' : 'DEPLOY SERVICE'}<span>→</span>
      </MagneticButton>
    </div>
  )
}
