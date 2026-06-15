import { useEffect, useState } from "react"

const DATA = [
	{ day: "Mon", count: 4 },
	{ day: "Tue", count: 7 },
	{ day: "Wed", count: 3 },
	{ day: "Thu", count: 9 },
	{ day: "Fri", count: 12 },
	{ day: "Sat", count: 2 },
	{ day: "Sun", count: 5 },
] // mock — wire to GET /metrics/deployments?range=7d later

const PLOT = 210
const MAX = Math.max(...DATA.map((d) => d.count))
const TOTAL = DATA.reduce((a, d) => a + d.count, 0)
const GOLD = "var(--accent)"
const GOLD_DIM = "rgba(230, 210, 162, 0.42)"
const GOLD_HI = "var(--accent-hover)"

const S = {
	card: {
		marginTop: 20, background: "var(--bg-card)", border: "1px solid var(--border)",
		borderRadius: 18, padding: 24,
	},
	head: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22 },
	title: { fontFamily: "var(--font-nav)", fontSize: 15, letterSpacing: "0.04em", color: "var(--text-primary)" },
	total: { fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" },
	totalNum: { color: "var(--accent)", fontWeight: 600 },
	plot: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, height: PLOT },
	col: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, height: "100%", justifyContent: "flex-end" },
	count: { fontFamily: "var(--font-nav)", fontSize: 12, color: "var(--text-secondary)" },
	bar: { width: "100%", maxWidth: 46, borderRadius: "8px 8px 0 0", transition: "height 0.8s ease, background 0.2s ease" },
	day: { fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" },
}

export default function DeploymentsChart() {
	const [filled, setFilled] = useState(false)
	const [hover, setHover] = useState(null)

	useEffect(() => {
		const t = setTimeout(() => setFilled(true), 120)
		return () => clearTimeout(t)
	}, [])

	return (
		<div style={S.card}>
			<div style={S.head}>
				<span style={S.title}>Deployments this week</span>
				<span style={S.total}>
					<span style={S.totalNum}>{TOTAL}</span> total
				</span>
			</div>
			<div style={S.plot}>
				{DATA.map((d, i) => {
					const h = filled ? (d.count / MAX) * (PLOT - 56) : 0
					const bg = i === hover ? GOLD_HI : d.count === MAX ? GOLD : GOLD_DIM
					const barStyle = Object.assign({}, S.bar, { height: h, background: bg })
					return (
						<div
							key={d.day} style={S.col}
							onMouseEnter={() => setHover(i)}
							onMouseLeave={() => setHover(null)}
						>
							<span style={S.count}>{d.count}</span>
							<div style={barStyle} />
							<span style={S.day}>{d.day}</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}