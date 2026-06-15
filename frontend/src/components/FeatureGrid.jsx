const GROUPS = [
  {
    pillar: "DEPLOY",
    icon: "\u25B2",
    features: [
      { name: "Container Deployments", desc: "Ship any image to a target namespace in seconds." },
      { name: "Canary Rollouts", desc: "Progressive 20 to 100% traffic shifts via Argo Rollouts." },
      { name: "Namespace Targeting", desc: "Route workloads to the right team namespace." },
    ],
  },
  {
    pillar: "OBSERVE",
    icon: "\u25CE",
    features: [
      { name: "Service Health", desc: "Live status across every running service." },
      { name: "Rollout Tracking", desc: "Watch each canary step as it advances." },
      { name: "Operational Visibility", desc: "One surface for the whole deployment state." },
    ],
  },
  {
    pillar: "RECOVER",
    icon: "\u21BA",
    features: [
      { name: "Instant Rollback", desc: "Revert to the last stable revision in one move." },
      { name: "Recovery Workflows", desc: "Guided steps to bring a service back to health." },
      { name: "Deployment History", desc: "Trace every revision and who shipped it." },
    ],
  },
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
    marginBottom: "48px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "56px",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  pillarHead: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingBottom: "18px",
    borderBottom: "1px solid var(--divider)",
  },
  pillarIcon: {
    fontSize: "18px",
    color: "var(--accent)",
  },
  pillarName: {
    fontFamily: "var(--font-nav)",
    fontSize: "13px",
    letterSpacing: "0.2em",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  feature: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  featureName: {
    fontFamily: "var(--font-body)",
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  featureDesc: {
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "var(--text-muted)",
  },
}

export default function FeatureGrid() {
  return (
    <section style={S.section}>
      <p style={S.kicker}>CAPABILITIES</p>
      <div style={S.grid}>
        {GROUPS.map((g) => (
          <div style={S.col} key={g.pillar}>
            <div style={S.pillarHead}>
              <span style={S.pillarIcon}>{g.icon}</span>
              <span style={S.pillarName}>{g.pillar}</span>
            </div>
            {g.features.map((f) => (
              <div style={S.feature} key={f.name}>
                <span style={S.featureName}>{f.name}</span>
                <span style={S.featureDesc}>{f.desc}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}