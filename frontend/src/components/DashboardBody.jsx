import { Link } from "react-router-dom"

const DEPLOYS = [
	{ service: "payment-api", action: "Deployed v2.3.1", who: "aaroh", time: "2m ago", tone: "var(--success)" },
	{ service: "checkout-service", action: "Rollback to v1.9.0", who: "sre", time: "18m ago", tone: "var(--warning)" },
	{ service: "auth-service", action: "Canary 60% \u2192 100%", who: "aaroh", time: "1h ago", tone: "var(--info)" },
	{ service: "notify-worker", action: "Deployed v0.8.0", who: "dev", time: "3h ago", tone: "var(--success)" },
]

const SERVICES = [
	{ name: "payment-api", status: "Healthy", tone: "var(--success)" },
	{ name: "checkout-service", status: "Degraded", tone: "var(--warning)" },
	{ name: "auth-service", status: "Healthy", tone: "var(--success)" },
	{ name: "gateway", status: "Healthy", tone: "var(--success)" },
]
// mock data — wire to live cluster state later

const S = {
	body: { display: "flex", flexWrap: "wrap", gap: 20, marginTop: 20 },
	panelLeft: {
		flex: "2 1 380px", minWidth: 0, background: "var(--bg-card)",
		border: "1px solid var(--border)", borderRadius: 18, padding: 24,
		display: "flex", flexDirection: "column",
	},
	panelRight: {
		flex: "1 1 280px", minWidth: 0, background: "var(--bg-card)",
		border: "1px solid var(--border)", borderRadius: 18, padding: 24,
		display: "flex", flexDirection: "column",
	},
	head: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
	title: { fontFamily: "var(--font-nav)", fontSize: 15, letterSpacing: "0.04em", color: "var(--text-primary)" },
	viewAll: { fontFamily: "var(--font-nav)", fontSize: 12, color: "var(--text-muted)", textDecoration: "none" },
	headMeta: { fontFamily: "var(--font-nav)", fontSize: 12, color: "var(--text-muted)" },
	list: { display: "flex", flexDirection: "column" },
	row: { display: "flex", alignItems: "center", gap: 14, padding: "15px 0" },
	dot: { width: 9, height: 9, borderRadius: "50%", flexShrink: 0, display: "block" },
	dMeta: { display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 },
	svc: { fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", fontWeight: 600 },
	act: { fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)" },
	rRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 },
	time: { fontFamily: "var(--font-nav)", fontSize: 11, color: "var(--text-secondary)" },
	who: { fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" },
	hRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" },
	hName: { fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" },
	pill: {
		fontFamily: "var(--font-nav)", fontSize: 10, letterSpacing: "0.12em",
		padding: "4px 10px", borderRadius: 999, border: "1px solid", background: "transparent",
	},
}

function dotStyle(tone) { return { ...S.dot, background: tone } }
function pillStyle(tone) { return { ...S.pill, color: tone, borderColor: tone } }
function rowStyle(base, i, len) { return { ...base, borderBottom: i === len - 1 ? "none" : "1px solid var(--divider)" } }

export default function DashboardBody() {
	return (
		<div style={S.body}>
			<div style={S.panelLeft}>
				<div style={S.head}>
					<span style={S.title}>Recent Deployments</span>
					<Link to="/catalog" style={S.viewAll}>View all</Link>
				</div>
				<div style={S.list}>
					{DEPLOYS.map((d, i) => (
						<div key={d.service + d.time} style={rowStyle(S.row, i, DEPLOYS.length)}>
							<span style={dotStyle(d.tone)} />
							<div style={S.dMeta}>
								<span style={S.svc}>{d.service}</span>
								<span style={S.act}>{d.action}</span>
							</div>
							<div style={S.rRight}>
								<span style={S.time}>{d.time}</span>
								<span style={S.who}>by {d.who}</span>
							</div>
						</div>
					))}
				</div>
			</div>

			<div style={S.panelRight}>
				<div style={S.head}>
					<span style={S.title}>Service Health</span>
					<span style={S.headMeta}>22 / 24 healthy</span>
				</div>
				<div style={S.list}>
					{SERVICES.map((s, i) => (
						<div key={s.name} style={rowStyle(S.hRow, i, SERVICES.length)}>
							<span style={S.hName}>{s.name}</span>
							<span style={pillStyle(s.tone)}>{s.status.toUpperCase()}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}