// Mock environment data — wire to real per-namespace counts when EKS is back up.
const ENVS = [
  { name: "Production", status: "Healthy", services: 18 },
  { name: "Staging", status: "Healthy", services: 4 },
  { name: "Development", status: "Healthy", services: 2 },
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
    marginBottom: "44px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid var(--divider)",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    padding: "26px 8px",
    borderBottom: "1px solid var(--divider)",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  dot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "var(--success)",
    flexShrink: 0,
  },
  name: {
    fontFamily: "var(--font-hero)",
    fontSize: "24px",
    fontWeight: "400",
    color: "var(--text-primary)",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },
  status: {
    fontFamily: "var(--font-nav)",
    fontSize: "11px",
    letterSpacing: "0.16em",
    color: "var(--success)",
  },
  count: {
    fontFamily: "var(--font-body)",
    fontSize: "15px",
    color: "var(--text-muted)",
  },
}

export default function EnvironmentOverview() {
  return (
    <section style={S.section}>
      <p style={S.kicker}>ENVIRONMENTS</p>
      <div style={S.list}>
        {ENVS.map((e) => (
          <div style={S.row} key={e.name}>
            <div style={S.left}>
              <span style={S.dot} />
              <span style={S.name}>{e.name}</span>
            </div>
            <div style={S.right}>
              <span style={S.status}>{e.status.toUpperCase()}</span>
              <span style={S.count}>{e.services} services</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}