import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import './Catalog.css'
import { apiGet } from '../lib/api'

const FIELD_BG = 'rgba(255,255,255,0.03)'
const FIELD_BORDER = 'rgba(255,255,255,0.12)'

const STATUS = {
  HEALTHY:     { color: 'var(--success)', bg: 'rgba(76,175,130,0.12)' },
  PROGRESSING: { color: 'var(--info)',    bg: 'rgba(111,168,220,0.12)' },
  DEGRADED:    { color: 'var(--warning)', bg: 'rgba(232,168,56,0.12)' },
  ABORTED:     { color: 'var(--danger)',  bg: 'rgba(232,80,80,0.12)' },
  UNKNOWN:     { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)' },
}

const S = {
  page:    { maxWidth: '1120px', margin: '0 auto', padding: '72px 32px 140px' },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' },
  kicker:  { fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.22em', color: 'var(--text-muted)' },
  live:    { fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--accent)', border: '1px solid var(--divider)', borderRadius: '999px', padding: '6px 14px', background: 'rgba(230,210,162,0.08)' },
  h1:      { fontFamily: 'var(--font-hero)', fontSize: 'clamp(56px, 9vw, 120px)', lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '24px' },
  bridge:  { fontFamily: 'var(--font-nav)', fontSize: '13px', letterSpacing: '0.32em', color: 'var(--accent)', marginBottom: '56px' },
  controls:{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' },
  search:  { flex: 1, minWidth: '240px', background: FIELD_BG, border: '1px solid ' + FIELD_BORDER, color: '#FBF9F6', fontFamily: 'var(--font-body)', fontSize: '15px', padding: '15px 18px', borderRadius: 'var(--radius)', outline: 'none' },
  select:  { background: FIELD_BG, border: '1px solid ' + FIELD_BORDER, color: '#FBF9F6', fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.1em', padding: '15px 18px', borderRadius: 'var(--radius)', outline: 'none', cursor: 'pointer' },
  option:  { background: 'var(--bg-elevated)', color: 'var(--text-primary)' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  team:    { fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--text-muted)' },
  badge:   { fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.12em', padding: '5px 12px', borderRadius: '999px' },
  cardName:{ fontFamily: 'var(--font-hero)', fontSize: '30px', lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: '24px', wordBreak: 'break-word' },
  metaRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid ' + FIELD_BORDER },
  metaK:   { fontFamily: 'var(--font-nav)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--text-muted)' },
  metaV:   { fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' },
  image:   { fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cta:     { marginTop: '24px', fontFamily: 'var(--font-nav)', fontSize: '11px', letterSpacing: '0.18em', color: 'var(--accent)' },
  state:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '120px 0' },
  stateMsg:{ fontFamily: 'var(--font-nav)', fontSize: '13px', letterSpacing: '0.18em', color: 'var(--text-muted)' },
  stateBtn:{ fontFamily: 'var(--font-nav)', fontSize: '12px', letterSpacing: '0.16em', color: 'var(--bg)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', padding: '16px 28px', cursor: 'pointer' },
}

const teamLabel = (t) => t ? t.replace(/^team-/, '').toUpperCase() : 'UNGROUPED'

const statusKey = (raw) => {
  const st = (raw || '').toString().toUpperCase()
  if (STATUS[st]) return st
  if (st.includes('HEAL')) return 'HEALTHY'
  if (st.includes('PROG')) return 'PROGRESSING'
  if (st.includes('DEGRAD')) return 'DEGRADED'
  if (st.includes('ABORT') || st.includes('FAIL')) return 'ABORTED'
  return 'UNKNOWN'
}

const normalize = (s) => {
  const name = s.name || s.service_name || (s.metadata && s.metadata.name) || 'unknown'
  const team = s.team || s.namespace || s.deployment_group || ''
  const replicas = s.replicas != null ? s.replicas : (s.replica_count != null ? s.replica_count : (s.spec && s.spec.replicas))
  const image = s.image || s.container_image || ''
  return { name, team, status: statusKey(s.status || s.health || s.phase), replicas, image }
}

export default function Catalog() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState('ALL')
  const [status, setStatus] = useState('ALL')

  const load = () => {
  setLoading(true)
  setError(null)
  apiGet('/services')
    .then(data => {
      const list = Array.isArray(data) ? data : (data.services || data.items || [])
      setServices(list.map(normalize))
      setLoading(false)
    })
    .catch(e => { setError(e.message || 'FETCH FAILED'); setLoading(false) })
}

  useEffect(() => { load() }, [])

  const teams = ['ALL'].concat(Array.from(new Set(services.map(s => s.team).filter(Boolean))))
  const statuses = ['ALL'].concat(Array.from(new Set(services.map(s => s.status))))

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) &&
    (team === 'ALL' || s.team === team) &&
    (status === 'ALL' || s.status === status)
  )

  const go = (s) => navigate('/services/' + s.name + '?namespace=' + s.team)
  const badgeStyle = (st) => Object.assign({}, S.badge, { color: STATUS[st].color, background: STATUS[st].bg })

  return (
    <div style={S.page}>
      <div style={S.header}>
        <p style={S.kicker}>VIBRANIUM / CATALOG</p>
        <span style={S.live}>{services.length} SERVICES</span>
      </div>

      <h1 style={S.h1}>CATALOG.</h1>
      <p style={S.bridge}>EVERY SERVICE IN THE FLEET.</p>

      <div style={S.controls}>
        <input className="cat-field" style={S.search} placeholder="SEARCH SERVICES..."
          value={query} onChange={e => setQuery(e.target.value)} />
        <select className="cat-field" style={S.select} value={team} onChange={e => setTeam(e.target.value)}>
          {teams.map(t => (<option key={t} value={t} style={S.option}>{t === 'ALL' ? 'ALL GROUPS' : teamLabel(t)}</option>))}
        </select>
        <select className="cat-field" style={S.select} value={status} onChange={e => setStatus(e.target.value)}>
          {statuses.map(st => (<option key={st} value={st} style={S.option}>{st === 'ALL' ? 'ALL STATUS' : st}</option>))}
        </select>
      </div>

      {loading && (
        <div style={S.state}><Loader /><p style={S.stateMsg}>SCANNING THE FLEET...</p></div>
      )}

      {!loading && error && (
        <div style={S.state}>
          <p style={S.stateMsg}>UPLINK FAILED — {error.toUpperCase()}</p>
          <button style={S.stateBtn} onClick={load}>RETRY</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={S.state}>
          <p style={S.stateMsg}>NO SERVICES MATCH.</p>
          <button style={S.stateBtn} onClick={() => navigate('/deploy')}>DEPLOY ONE →</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={S.grid}>
          {filtered.map(s => (
            <div key={s.name} className="svc-card" onClick={() => go(s)}>
              <div style={S.cardTop}>
                <span style={S.team}>{teamLabel(s.team)}</span>
                <span style={badgeStyle(s.status)}>● {s.status}</span>
              </div>
              <h3 style={S.cardName}>{s.name}</h3>
              <div style={S.metaRow}>
                <span style={S.metaK}>REPLICAS</span>
                <span style={S.metaV}>{s.replicas != null ? s.replicas : '—'}</span>
              </div>
              <p style={S.image}>{s.image || 'no image'}</p>
              <div className="svc-cta" style={S.cta}>VIEW DETAILS →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
