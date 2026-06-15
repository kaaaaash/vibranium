// Mock activity — wire to a real event stream / audit log when EKS + persistence exist.
const EVENTS = [
  { time: "14:02", text: "payment-api deployed", meta: "by Aaroh", type: "deploy" },
  { time: "14:08", text: "canary promoted to 100%", meta: "payment-api", type: "promote" },
  { time: "14:12", text: "checkout-service rollback completed", meta: "by SRE", type: "rollback" },
  { time: "14:15", text: "auth-service healthy", meta: "health check", type: "healthy" },
]

const TYPE_COLOR = {
  deploy: "var(--accent)",
  promote: "var(--info)",
  rollback: "var(--warning)",
  healthy: "var(--success)",
}

function dotStyle(type) {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
    background: TYPE_COLOR[type] || "var(--text-muted)",
  }
}

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
  feed: {
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid var(--divider)",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    padding: "18px 8px",
    borderBottom: "1px solid var(--divider)",
  },
  time: {
    fontFamily: "var(--font-nav)",
    fontSize: "13px",
    letterSpacing: "0.06em",
    color: "var(--text-muted)",
    minWidth: "48px",
  },
  text: {
    fontFamily: "var(--font-body)",
    fontSize: "15px",
    color: "var(--text-primary)",
  },
  meta: {
    fontFamily: "var(--font-body)",
    fontSize: "13px",
    color: "var(--text-muted)",
    marginLeft: "auto",
  },
}

export default function ActivityFeed() {
  return (
    <section style={S.section}>
      <p style={S.kicker}>RECENT ACTIVITY</p>
      <div style={S.feed}>
        {EVENTS.map((e) => (
          <div style={S.row} key={e.time + e.text}>
            <span style={dotStyle(e.type)} />
            <span style={S.time}>{e.time}</span>
            <span style={S.text}>{e.text}</span>
            <span style={S.meta}>{e.meta}</span>
          </div>
        ))}
      </div>
    </section>
  )
}