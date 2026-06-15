import { Link } from "react-router-dom"

const linkEnter = (e) => { e.currentTarget.style.color = "var(--accent)" }
const linkLeave = (e) => { e.currentTarget.style.color = "var(--text-secondary)" }

const S = {
  footer: {
    position: "relative",
    padding: "72px 48px 56px",
    borderTop: "1px solid var(--divider)",
    background: "var(--bg-elevated)",
  },
  top: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "40px",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "360px",
  },
  wordmark: {
    fontFamily: "var(--font-hero)",
    fontSize: "40px",
    letterSpacing: "-0.01em",
    color: "var(--accent)",
  },
  brandSub: {
    fontFamily: "var(--font-nav)",
    fontSize: "11px",
    letterSpacing: "0.18em",
    color: "var(--text-secondary)",
  },
  tagline: {
    fontFamily: "var(--font-nav)",
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "var(--text-muted)",
  },
  links: {
    display: "flex",
    gap: "56px",
    flexWrap: "wrap",
  },
  linkCol: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  linkHead: {
    fontFamily: "var(--font-nav)",
    fontSize: "10px",
    letterSpacing: "0.2em",
    color: "var(--text-muted)",
    marginBottom: "4px",
  },
  link: {
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    color: "var(--text-secondary)",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    marginTop: "56px",
    paddingTop: "28px",
    borderTop: "1px solid var(--divider)",
  },
  meta: {
    fontFamily: "var(--font-body)",
    fontSize: "12px",
    color: "var(--text-muted)",
  },
}

export default function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.top}>
        <div style={S.brand}>
          <span style={S.wordmark}>VIB.</span>
          <span style={S.brandSub}>PLATFORM ENGINEERING CONTROL PLANE</span>
          <span style={S.tagline}>DEPLOY. OBSERVE. RECOVER.</span>
        </div>
        <div style={S.links}>
          <div style={S.linkCol}>
            <span style={S.linkHead}>PLATFORM</span>
            <Link to="/dashboard" style={S.link} onMouseEnter={linkEnter} onMouseLeave={linkLeave}>Dashboard</Link>
            <Link to="/catalog" style={S.link} onMouseEnter={linkEnter} onMouseLeave={linkLeave}>Catalog</Link>
            <Link to="/deploy" style={S.link} onMouseEnter={linkEnter} onMouseLeave={linkLeave}>Deploy</Link>
            <Link to="/profile" style={S.link} onMouseEnter={linkEnter} onMouseLeave={linkLeave}>Profile</Link>
          </div>
        </div>
      </div>
      <div style={S.bottom}>
        <span style={S.meta}>{"\u00A9"} 2026 VIB</span>
        <span style={S.meta}>{"v0.5.0 \u00B7 Built on Kubernetes"}</span>
      </div>
    </footer>
  )
}