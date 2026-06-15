import { Fragment } from "react"

const FLOW = [
  { name: "React", role: "SPA / Vite" },
  { name: "FastAPI", role: "REST / RBAC" },
  { name: "Kubernetes", role: "EKS" },
  { name: "Argo Rollouts", role: "Canary" },
]

const S = {
  section: {
    position: "relative",
    padding: "100px 48px",
  },
  kicker: {
    fontFamily: "var(--font-nav)",
    fontSize: "11px",
    letterSpacing: "0.24em",
    color: "var(--accent)",
    marginBottom: "28px",
  },
  headline: {
    fontFamily: "var(--font-hero)",
    fontSize: "clamp(34px, 5vw, 64px)",
    fontWeight: "400",
    lineHeight: 1.05,
    color: "var(--text-primary)",
    marginBottom: "56px",
  },
  flow: {
    display: "flex",
    alignItems: "stretch",
    flexWrap: "wrap",
    gap: "16px",
  },
  node: {
    flex: "1 1 160px",
    minWidth: "150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "26px 20px",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    textAlign: "center",
  },
  nodeName: {
    fontFamily: "var(--font-nav)",
    fontSize: "15px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    color: "var(--text-primary)",
  },
  nodeRole: {
    fontFamily: "var(--font-body)",
    fontSize: "12px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  },
  arrow: {
    display: "flex",
    alignItems: "center",
    fontSize: "20px",
    color: "var(--accent)",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "48px",
    marginTop: "48px",
    paddingTop: "32px",
    borderTop: "1px solid var(--divider)",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  metaLabel: {
    fontFamily: "var(--font-nav)",
    fontSize: "10px",
    letterSpacing: "0.2em",
    color: "var(--text-muted)",
  },
  metaVal: {
    fontFamily: "var(--font-body)",
    fontSize: "16px",
    color: "var(--text-primary)",
  },
}

export default function ArchitectureSection() {
  return (
    <section style={S.section}>
      <p style={S.kicker}>ARCHITECTURE</p>
      <h2 style={S.headline}>Built like real infrastructure.</h2>
      <div style={S.flow}>
        {FLOW.map((n, i) => (
          <Fragment key={n.name}>
            {i > 0 ? <span style={S.arrow}>{"\u2192"}</span> : null}
            <div style={S.node}>
              <span style={S.nodeName}>{n.name}</span>
              <span style={S.nodeRole}>{n.role}</span>
            </div>
          </Fragment>
        ))}
      </div>
      <div style={S.meta}>
        <div style={S.metaItem}>
          <span style={S.metaLabel}>SECURED BY</span>
          <span style={S.metaVal}>Google OAuth + JWT</span>
        </div>
        <div style={S.metaItem}>
          <span style={S.metaLabel}>RUNNING ON</span>
          <span style={S.metaVal}>AWS EKS (ap-south-1)</span>
        </div>
      </div>
    </section>
  )
}