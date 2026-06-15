import { Link } from "react-router-dom"
import VibraniumDust from "../components/VibraniumDust"
import DisplayCards from "../components/DisplayCards"
import StatusStrip from "../components/StatusStrip"
import FeatureGrid from "../components/FeatureGrid"
import EnvironmentOverview from "../components/EnvironmentOverview"
import ActivityFeed from "../components/ActivityFeed"
import SecuritySection from "../components/SecuritySection"
import ArchitectureSection from "../components/ArchitectureSection" 
import Footer from "../components/Footer"
const S = {
  page: {
    position: "relative",
    width: "100%",
    background: "var(--bg)",
  },

  // --- HERO: wordmark anchored to the bottom (loader-style) ---
  hero: {
    position: "relative",
    overflow: "hidden",
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "0 0 64px 48px",
  },
  heroContent: { position: "relative", zIndex: 1 },
  tag: {
  color: "var(--text-muted)",
  fontFamily: "var(--font-nav)",
  fontSize: "11px",
  letterSpacing: "0.15em",
  marginBottom: "44px",
  },
  h1: {
    color: "var(--accent)",
    fontSize: "clamp(64px, 12vw, 160px)",
    letterSpacing: "-0.02em",
    fontFamily: "var(--font-hero)",
    fontWeight: "400",
    lineHeight: 0.9,
  },
  heroFade: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: "240px",
  background: "linear-gradient(to bottom, transparent, var(--bg))",
  zIndex: 0,
  pointerEvents: "none",
  },
  
  // --- WHAT IS VIB ---
intro: {
  position: "relative",
  padding: "110px 48px",
},
introKicker: {
  fontFamily: "var(--font-nav)",
  fontSize: "11px",
  letterSpacing: "0.24em",
  color: "var(--accent)",
  marginBottom: "28px",
},
introHeadline: {
  fontFamily: "var(--font-hero)",
  fontSize: "clamp(34px, 5vw, 64px)",
  lineHeight: 1.05,
  letterSpacing: "-0.01em",
  color: "var(--text-primary)",
  maxWidth: "900px",
  fontWeight: "400",
},
introBody: {
  fontFamily: "var(--font-body)",
  fontSize: "18px",
  lineHeight: 1.7,
  color: "var(--text-secondary)",
  maxWidth: "620px",
  marginTop: "32px",
},


  ctaRow: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
    marginTop: "44px",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    padding: "18px 36px",
    background: "var(--accent)",
    color: "var(--bg)",
    border: "none",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-nav)",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textDecoration: "none",
    transition: "all 0.18s ease",
  },
  ctaSecondary: {
    color: "var(--text-muted)",
    fontFamily: "var(--font-nav)",
    fontSize: "11px",
    letterSpacing: "0.18em",
    textDecoration: "none",
    transition: "color 0.18s ease",
  },

  // --- CARDS ---
  cards: {
    position: "relative",
    padding: "0px 24px 120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cardsKicker: {
    fontFamily: "var(--font-nav)",
    fontSize: "11px",
    letterSpacing: "0.22em",
    color: "var(--text-muted)",
  },
}

export default function Homepage() {
  const ctaEnter = (e) => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.transform = "translateY(-2px)" }
  const ctaLeave = (e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.transform = "translateY(0)" }
  const linkEnter = (e) => { e.currentTarget.style.color = "var(--accent)" }
  const linkLeave = (e) => { e.currentTarget.style.color = "var(--text-muted)" }

  return (
    <main style={S.page}>
      <section style={S.hero}>
        <VibraniumDust />
        <div style={S.heroContent}>
         <div style={S.heroContent}></div>
          <p style={S.tag}>DEPLOY. OBSERVE. RECOVER.</p>
          <h1 style={S.h1}>VIBRANIUM.</h1>
        </div>
      </section>
      <StatusStrip />

      <section style={S.intro}>
  <p style={S.introKicker}>THE CONTROL PLANE</p>
  <h2 style={S.introHeadline}>
    Deploy services. Observe rollouts. Recover instantly.
  </h2>
  <p style={S.introBody}>
    VIB unifies deployment, visibility, and recovery into a single
    operational surface &mdash; built on Kubernetes, with progressive
    delivery and one-move rollback baked in.
  </p>
  <div style={S.ctaRow}>
    <Link to="/deploy" style={S.ctaPrimary} onMouseEnter={ctaEnter} onMouseLeave={ctaLeave}>
      DEPLOY A SERVICE <span>&rarr;</span>
    </Link>
    <Link to="/catalog" style={S.ctaSecondary} onMouseEnter={linkEnter} onMouseLeave={linkLeave}>
      BROWSE CATALOG &rarr;
    </Link>
  </div>
</section>
      <section style={S.cards}>
        <p style={S.cardsKicker}>QUICK ACTIONS</p>
        <DisplayCards />
      </section>
      <FeatureGrid />
      <EnvironmentOverview />
      <ActivityFeed />
      <SecuritySection />
      <ArchitectureSection />
      <Footer />

    </main>
  )
}