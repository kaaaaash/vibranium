const ITEMS = [
  { name: "GOOGLE SSO", desc: "Sign in with Google OAuth 2.0 \u2014 no passwords ever stored." },
  { name: "ROLE-BASED ACCESS", desc: "Viewer, Developer, SRE, and Platform Admin roles gate every action." },
  { name: "NAMESPACE ISOLATION", desc: "Users only see and operate on services in their team's namespace." },
  { name: "SERVER-SIDE AUTHORIZATION", desc: "Every request is verified against a signed JWT and a permission check." },
  { name: "AUDIT TRAIL", desc: "Every deploy and rollback is attributable to an authenticated identity." },
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
    marginBottom: "16px",
  },
  sub: {
    fontFamily: "var(--font-body)",
    fontSize: "18px",
    lineHeight: 1.6,
    color: "var(--text-secondary)",
    maxWidth: "560px",
    marginBottom: "56px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "28px",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
  },
  head: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  check: {
    color: "var(--accent)",
    fontSize: "16px",
    fontWeight: "700",
  },
  name: {
    fontFamily: "var(--font-nav)",
    fontSize: "13px",
    letterSpacing: "0.14em",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  desc: {
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "var(--text-muted)",
  },
}

export default function SecuritySection() {
  return (
    <section style={S.section}>
      <p style={S.kicker}>SECURITY</p>
      <h2 style={S.headline}>Secure by default.</h2>
      <p style={S.sub}>
        Identity-first access control, enforced on the server &mdash; not the browser.
      </p>
      <div style={S.grid}>
        {ITEMS.map((it) => (
          <div style={S.card} key={it.name}>
            <div style={S.head}>
              <span style={S.check}>{"\u2713"}</span>
              <span style={S.name}>{it.name}</span>
            </div>
            <span style={S.desc}>{it.desc}</span>
          </div>
        ))}
      </div>
    </section>
  )
}