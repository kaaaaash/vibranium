import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import './RolloutDetails.css'
import { apiFetch } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8001'
const CANARY_STEPS = [20, 40, 60, 80, 100]

const STATUS = {
  HEALTHY:     { color: 'var(--success)', bg: 'rgba(76,175,130,0.12)' },
  PROGRESSING: { color: 'var(--info)',    bg: 'rgba(111,168,220,0.12)' },
  PAUSED:      { color: 'var(--accent)',  bg: 'rgba(230,210,162,0.12)' },
  DEGRADED:    { color: 'var(--warning)', bg: 'rgba(232,168,56,0.12)' },
  ABORTED:     { color: 'var(--danger)',  bg: 'rgba(232,80,80,0.12)' },
  UNKNOWN:     { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)' },
}

const statusKey = (raw) => {
  const st = (raw || '').toString().toUpperCase()
  if (STATUS[st]) return st
  if (st.includes('HEAL')) return 'HEALTHY'
  if (st.includes('PROG')) return 'PROGRESSING'
  if (st.includes('PAUSE')) return 'PAUSED'
  if (st.includes('DEGRAD')) return 'DEGRADED'
  if (st.includes('ABORT') || st.includes('FAIL')) return 'ABORTED'
  return 'UNKNOWN'
}

const pick = (...vals) => vals.find(v => v != null)
const show = (v) => (v == null || typeof v === 'object') ? '—' : v

const normalize = (d) => {
  if (!d) return null
  const rep = (d.replicas && typeof d.replicas === 'object') ? d.replicas : {}
  const repNum = typeof d.replicas === 'number' ? d.replicas : undefined
  const canary = (d.canary && typeof d.canary === 'object') ? d.canary : {}
  const curStep = pick(canary.current_step, canary.currentStep)
  const totStep = pick(canary.total_steps, canary.totalSteps)
  const weightPct = (curStep != null && totStep) ? Math.round((Number(curStep) / Number(totStep)) * 100) : null
  return {
    phase: statusKey(pick(d.phase, d.status, d.health, 'UNKNOWN')),
    desired: pick(rep.desired, repNum, d.desired_replicas, d.spec_replicas),
    ready: pick(rep.ready, d.ready_replicas, d.ready),
    available: pick(rep.available, d.available_replicas, d.available),
    updated: pick(rep.updated, d.updated_replicas, d.updated),
    image: pick(d.image, d.container_image, ''),
    weightPct, curStep, totStep,
    message: pick(d.message, d.status_message, ''),
    strategy: pick(d.strategy, d.canary ? 'Canary' : '', ''),
    raw: d,
  }
}

const teamLabel = (t) => t ? t.replace(/^team-/, '').toUpperCase() : 'DEFAULT'

const S = {
  page:    { maxWidth: '960px', margin: '0 auto', padding: '56px 32px 140px' },
  back:    { fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: '40px', display: 'inline-block' },
  header:  { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', marginBottom: '16px' },
  kicker:  { fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.22em', color: 'var(--text-muted)', marginBottom: '14px' },
  h1:      { fontFamily: 'var(--font-hero)', fontSize: 'clamp(44px, 7vw, 84px)', lineHeight: 0.92, letterSpacing: '-0.02em', wordBreak: 'break-word' },
  live:    { display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)' },
  badge:   { fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.14em', padding: '8px 16px', borderRadius: '999px', display: 'inline-block', marginBottom: '40px' },
  strip:   { display: 'flex', flexWrap: 'wrap', border: '1px solid var(--divider)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '40px' },
  cell:    { flex: '1 1 180px', padding: '18px 22px', borderRight: '1px solid var(--divider)' },
  cellLast:{ flex: '1 1 180px', padding: '18px 22px' },
  cellK:   { fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: '8px' },
  cellV:   { fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-primary)', wordBreak: 'break-all' },
  panel:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px', marginBottom: '32px' },
  panelTtl:{ fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.2em', color: 'var(--text-secondary)', marginBottom: '28px' },
  barTrack:{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' },
  steps:   { display: 'flex', justifyContent: 'space-between', gap: '8px' },
  msg:     { fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--divider)' },
  repRow:  { display: 'flex', gap: '32px', flexWrap: 'wrap', marginTop: '24px' },
  repK:    { fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: '6px' },
  repV:    { fontFamily: 'var(--font-hero)', fontSize: '32px', color: 'var(--text-primary)' },
  actions: { display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '8px' },
  primary: { fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.16em', color: 'var(--bg)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', padding: '16px 28px' },
  danger:  { fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.16em', color: 'var(--danger)', background: 'transparent', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', padding: '16px 28px' },
  deployBox:{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' },
  input:   { flex: 1, minWidth: '260px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', color: '#FBF9F6', fontFamily: 'var(--font-body)', fontSize: '14px', padding: '15px 18px', borderRadius: 'var(--radius)', outline: 'none' },
  toast:   { padding: '16px 22px', borderRadius: 'var(--radius)', fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.1em', marginBottom: '28px' },
  raw:     { marginTop: '40px' },
  rawSum:  { fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--text-muted)' },
  rawPre:  { fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '20px', marginTop: '14px', overflow: 'auto', maxHeight: '320px' },
  state:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '120px 0' },
  stateMsg:{ fontFamily: 'var(--font-nav)', fontSize: '13px', letterSpacing: '0.18em', color: 'var(--text-muted)' },
}

export default function RolloutDetails() {
  const { name } = useParams()
  const [sp] = useSearchParams()
  const namespace = sp.get('namespace') || 'default'
  const navigate = useNavigate()
  const { can } = useAuth()

  const [svc, setSvc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [showDeploy, setShowDeploy] = useState(false)
  const [newImage, setNewImage] = useState('')

  const qs = '?namespace=' + encodeURIComponent(namespace)

  const load = useCallback((silent) => {
    if (!silent) setLoading(true)
    apiFetch(API + '/services/' + name + '/rollout' + qs)
      .then(r => { if (r.status === 404) throw new Error('NOT_FOUND'); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then(d => { setSvc(normalize(d)); setError(null); setUpdatedAt(new Date()); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [name, qs])

  useEffect(() => { load(false) }, [load])
  useEffect(() => {
    const id = setInterval(() => load(true), 5000)
    return () => clearInterval(id)
  }, [load])

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000) }

  const rollback = () => {
    if (!window.confirm('Roll back ' + name + ' to the previous version?')) return
    setBusy(true)
    apiFetch(API + '/services/' + name + '/rollback' + qs, { method: 'POST' })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => { flash(ok ? 'ROLLBACK INITIATED' : 'ROLLBACK FAILED — ' + (d.detail || '')); load(true) })
      .catch(e => flash('ROLLBACK FAILED — ' + e.message))
      .finally(() => setBusy(false))
  }

  const deployImage = () => {
    if (!newImage.trim()) return
    setBusy(true)
    apiFetch(API + '/services/' + name + '/deploy' + qs, {
  method: 'POST',
  body: JSON.stringify({ image: newImage.trim() }),
})
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => { flash(ok ? 'ROLLOUT TRIGGERED' : 'DEPLOY FAILED — ' + (d.detail || '')); setShowDeploy(false); setNewImage(''); load(true) })
      .catch(e => flash('DEPLOY FAILED — ' + e.message))
      .finally(() => setBusy(false))
  }

  if (loading) {
    return <div style={S.page}><div style={S.state}><Loader /><p style={S.stateMsg}>READING ROLLOUT...</p></div></div>
  }

  if (error === 'NOT_FOUND') {
    return (
      <div style={S.page}>
        <div style={S.state}>
          <p style={S.stateMsg}>SERVICE "{name}" NOT FOUND IN {teamLabel(namespace)}.</p>
          <span className="rd-back rd-btn" style={S.back} onClick={() => navigate('/catalog')}>← BACK TO CATALOG</span>
        </div>
      </div>
    )
  }

  if (error || !svc) {
    return (
      <div style={S.page}>
        <div style={S.state}>
          <p style={S.stateMsg}>UPLINK FAILED — {error || 'NO DATA'}</p>
          <span className="rd-back rd-btn" style={S.back} onClick={() => load(false)}>RETRY</span>
        </div>
      </div>
    )
  }

  const badgeStyle = Object.assign({}, S.badge, { color: STATUS[svc.phase].color, background: STATUS[svc.phase].bg })
  const displayWeight = svc.weightPct != null ? svc.weightPct : (svc.phase === 'HEALTHY' ? 100 : 0)
  const barFill = { height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', width: displayWeight + '%' }
  const toastStyle = Object.assign({}, S.toast, toast && toast.includes('FAILED')
    ? { color: 'var(--danger)', background: 'rgba(232,80,80,0.1)', border: '1px solid var(--danger)' }
    : { color: 'var(--success)', background: 'rgba(76,175,130,0.1)', border: '1px solid var(--success)' })

  return (
    <div style={S.page}>
      <span className="rd-back rd-btn" style={S.back} onClick={() => navigate('/catalog')}>← CATALOG</span>

      {toast && <div style={toastStyle}>{toast}</div>}

      <div style={S.header}>
        <div>
          <p style={S.kicker}>VIBRANIUM / SERVICE / {teamLabel(namespace)}</p>
          <h1 style={S.h1}>{name}</h1>
        </div>
        <span style={S.live}>
          <span className="rd-pulse" style={S.liveDot} />
          {updatedAt ? 'UPDATED ' + updatedAt.toLocaleTimeString() : 'LIVE'}
        </span>
      </div>

      <span style={badgeStyle}>● {svc.phase}</span>

      <div style={S.strip}>
        <div style={S.cell}><p style={S.cellK}>NAMESPACE</p><p style={S.cellV}>{namespace}</p></div>
        <div style={S.cell}><p style={S.cellK}>STRATEGY</p><p style={S.cellV}>{show(svc.strategy) === '—' ? 'Canary' : show(svc.strategy)}</p></div>
        <div style={S.cell}><p style={S.cellK}>DESIRED</p><p style={S.cellV}>{show(svc.desired)}</p></div>
        <div style={S.cellLast}><p style={S.cellK}>IMAGE</p><p style={S.cellV}>{show(svc.image) || '—'}</p></div>
      </div>

      <div style={S.panel}>
        <p style={S.panelTtl}>CANARY ROLLOUT · {displayWeight}% TRAFFIC · STEP {show(svc.curStep)} / {show(svc.totStep)}</p>
        <div style={S.barTrack}><div className="rd-bar-fill" style={barFill} /></div>
        <div style={S.steps}>
          {CANARY_STEPS.map(step => {
            const active = displayWeight >= step
            const stepStyle = {
              flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.06em',
              border: '1px solid ' + (active ? 'var(--accent)' : 'var(--divider)'),
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              background: active ? 'rgba(230,210,162,0.08)' : 'transparent',
            }
            return <div key={step} className="rd-step" style={stepStyle}>{step}%</div>
          })}
        </div>

        <div style={S.repRow}>
          <div><p style={S.repK}>DESIRED</p><p style={S.repV}>{show(svc.desired)}</p></div>
          <div><p style={S.repK}>READY</p><p style={S.repV}>{show(svc.ready)}</p></div>
          <div><p style={S.repK}>AVAILABLE</p><p style={S.repV}>{show(svc.available)}</p></div>
          <div><p style={S.repK}>UPDATED</p><p style={S.repV}>{show(svc.updated)}</p></div>
        </div>

        {svc.message && <p style={S.msg}>{show(svc.message)}</p>}
      </div>

      <div style={S.actions}>
  {can('deploy') && (
    <button className="rd-btn rd-primary" style={S.primary} disabled={busy} onClick={() => setShowDeploy(v => !v)}>DEPLOY NEW IMAGE</button>
  )}
  {can('rollback') && (
    <button className="rd-btn rd-danger" style={S.danger} disabled={busy} onClick={rollback}>ROLLBACK</button>
  )}
  {!can('deploy') && !can('rollback') && (
    <span style={S.stateMsg}>● READ-ONLY ACCESS — VIEW PERMISSIONS ONLY</span>
  )}
</div>

      {showDeploy && (
        <div style={S.deployBox}>
          <input className="rd-field" style={S.input} placeholder="registry/image:tag"
            value={newImage} onChange={e => setNewImage(e.target.value)} />
          <button className="rd-btn rd-primary" style={S.primary} disabled={busy || !newImage.trim()} onClick={deployImage}>CONFIRM ROLLOUT</button>
        </div>
      )}

      <details className="rd-raw" style={S.raw}>
        <summary style={S.rawSum}>▸ RAW STATUS</summary>
        <pre style={S.rawPre}>{JSON.stringify(svc.raw, null, 2)}</pre>
      </details>
    </div>
  )
}
