import { useEffect, useState } from "react"

const CANARY_PCT = 0.6
const CANARY_STEP = "Step 3 of 5"
const UPTIME_BASE = 18 * 3600 + 32 * 60 + 12 // mock seconds — wire to real cluster later

function fmt(total) {
	const pad = (n) => String(n).padStart(2, "0")
	const h = Math.floor(total / 3600)
	const m = Math.floor((total % 3600) / 60)
	const s = total % 60
	return pad(h) + ":" + pad(m) + ":" + pad(s)
}

const SIZE = 184
const STROKE = 14
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

const S = {
	row: { display: "flex", flexWrap: "wrap", gap: 20, marginTop: 20 },
	gaugeCard: {
		flex: "1 1 320px", minWidth: 0, background: "var(--bg-card)",
		border: "1px solid var(--border)", borderRadius: 18, padding: 24,
		display: "flex", flexDirection: "column",
	},
	upCard: {
		flex: "1 1 280px", minWidth: 0, background: "var(--bg-elevated)",
		border: "1px solid var(--divider)", borderRadius: 18, padding: 24,
		display: "flex", flexDirection: "column", justifyContent: "space-between",
	},
	title: { fontFamily: "var(--font-nav)", fontSize: 15, letterSpacing: "0.04em", color: "var(--text-primary)", marginBottom: 6 },
	gaugeWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 },
	svgWrap: { position: "relative", width: SIZE, height: SIZE },
	progress: { transition: "stroke-dashoffset 1.1s ease" },
	center: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 },
	pct: { fontFamily: "var(--font-hero)", fontSize: 40, color: "var(--text-primary)", lineHeight: 1 },
	pctLabel: { fontFamily: "var(--font-nav)", fontSize: 10, letterSpacing: "0.16em", color: "var(--text-muted)" },
	gaugeFoot: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5 },
	gaugeSvc: { fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" },
	gaugeStep: { fontFamily: "var(--font-nav)", fontSize: 11, letterSpacing: "0.1em", color: "var(--accent)" },
	upLabel: { fontFamily: "var(--font-nav)", fontSize: 11, letterSpacing: "0.18em", color: "var(--text-muted)" },
	upTime: { fontFamily: "var(--font-hero)", fontSize: 52, color: "var(--accent)", lineHeight: 1, margin: "18px 0" },
	upStatus: { display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" },
	upDot: { width: 9, height: 9, borderRadius: "50%", background: "var(--success)", display: "block" },
	upRegion: { fontFamily: "var(--font-nav)", fontSize: 11, letterSpacing: "0.12em", color: "var(--text-muted)", marginTop: 4 },
}

export default function DashboardFooterRow() {
	const [uptime, setUptime] = useState(UPTIME_BASE)
	const [filled, setFilled] = useState(false)

	useEffect(() => {
		const id = setInterval(() => setUptime((u) => u + 1), 1000)
		return () => clearInterval(id)
	}, [])

	useEffect(() => {
		const t = setTimeout(() => setFilled(true), 120)
		return () => clearTimeout(t)
	}, [])

	const offset = filled ? C * (1 - CANARY_PCT) : C
	const center = SIZE / 2

	return (
		<div style={S.row}>
			<div style={S.gaugeCard}>
				<span style={S.title}>Canary Progress</span>
				<div style={S.gaugeWrap}>
					<div style={S.svgWrap}>
						<svg width={SIZE} height={SIZE}>
							<circle cx={center} cy={center} r={R} fill="none" stroke="var(--divider)" strokeWidth={STROKE} />
							<circle
								cx={center} cy={center} r={R} fill="none"
								stroke="var(--accent)" strokeWidth={STROKE} strokeLinecap="round"
								strokeDasharray={C} strokeDashoffset={offset} style={S.progress}
								transform={"rotate(-90 " + center + " " + center + ")"}
							/>
						</svg>
						<div style={S.center}>
							<span style={S.pct}>{Math.round(CANARY_PCT * 100)}%</span>
							<span style={S.pctLabel}>PROMOTED</span>
						</div>
					</div>
					<div style={S.gaugeFoot}>
						<span style={S.gaugeSvc}>payment-api {"\u2192"} v2.3.1</span>
						<span style={S.gaugeStep}>{CANARY_STEP}</span>
					</div>
				</div>
			</div>

			<div style={S.upCard}>
				<span style={S.upLabel}>CLUSTER UPTIME</span>
				<div style={S.upTime}>{fmt(uptime)}</div>
				<div>
					<div style={S.upStatus}>
						<span style={S.upDot} />
						All systems operational
					</div>
					<div style={S.upRegion}>AWS EKS {"\u00B7"} ap-south-1</div>
				</div>
			</div>
		</div>
	)
}