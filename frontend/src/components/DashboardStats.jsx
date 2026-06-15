const STATS = [
	{ label: "SERVICES", value: "24", sub: "across 4 namespaces", hero: true },
	{ label: "HEALTHY", value: "22", sub: "91% operational", tone: "var(--success)" },
	{ label: "ACTIVE ROLLOUTS", value: "2", sub: "canary in progress", tone: "var(--info)" },
	{ label: "DEGRADED", value: "1", sub: "needs attention", tone: "var(--warning)" },
]
// mock data — wire to GET /metrics/summary later

const S = {
	grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 32 },
	card: {
		background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18,
		padding: "24px 24px 22px", display: "flex", flexDirection: "column", gap: 16,
		transition: "transform 0.2s ease", cursor: "default",
	},
	cardHero: {
		background: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 18,
		padding: "24px 24px 22px", display: "flex", flexDirection: "column", gap: 16,
		transition: "transform 0.2s ease", cursor: "default",
	},
	top: { display: "flex", alignItems: "center", justifyContent: "space-between" },
	label: { fontFamily: "var(--font-nav)", fontSize: 11, letterSpacing: "0.16em", color: "var(--text-muted)" },
	labelHero: { fontFamily: "var(--font-nav)", fontSize: 11, letterSpacing: "0.16em", color: "rgba(40,0,0,0.6)" },
	badge: {
		width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
		justifyContent: "center", fontSize: 13, border: "1px solid var(--border)", color: "var(--text-secondary)",
	},
	badgeHero: {
		width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
		justifyContent: "center", fontSize: 13, border: "1px solid rgba(40,0,0,0.3)", color: "var(--bg)",
	},
	value: { fontFamily: "var(--font-hero)", fontSize: 44, fontWeight: 400, lineHeight: 1, color: "var(--text-primary)" },
	valueHero: { fontFamily: "var(--font-hero)", fontSize: 44, fontWeight: 400, lineHeight: 1, color: "var(--bg)" },
	sub: { display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 13 },
	dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0, display: "block" },
}

function dotStyle(s) {
	return { ...S.dot, background: s.hero ? "var(--bg)" : (s.tone || "var(--accent)") }
}
function subStyle(s) {
	return { ...S.sub, color: s.hero ? "rgba(40,0,0,0.7)" : "var(--text-muted)" }
}

export default function DashboardStats() {
	function cardEnter(e) { e.currentTarget.style.transform = "translateY(-3px)" }
	function cardLeave(e) { e.currentTarget.style.transform = "translateY(0)" }

	return (
		<div style={S.grid}>
			{STATS.map((s) => (
				<div key={s.label} style={s.hero ? S.cardHero : S.card} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
					<div style={S.top}>
						<span style={s.hero ? S.labelHero : S.label}>{s.label}</span>
						<span style={s.hero ? S.badgeHero : S.badge}>{"\u2197"}</span>
					</div>
					<div style={s.hero ? S.valueHero : S.value}>{s.value}</div>
					<div style={subStyle(s)}>
						<span style={dotStyle(s)} />
						{s.sub}
					</div>
				</div>
			))}
		</div>
	)
}