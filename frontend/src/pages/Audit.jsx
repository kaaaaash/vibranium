import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { apiGet } from "../lib/api"

const RESULT_COLORS = {
	success: "var(--success)",
	denied: "var(--warning)",
	failure: "var(--danger)",
}

const S = {
	wrap: { padding: "40px 48px", maxWidth: 1100, margin: "0 auto" },
	head: { marginBottom: 28 },
	kicker: { fontFamily: "var(--font-nav)", fontSize: 11, letterSpacing: "0.22em", color: "var(--accent)", marginBottom: 8 },
	title: { fontFamily: "var(--font-hero)", fontSize: 34, color: "var(--text-primary)", margin: 0 },
	sub: { fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginTop: 8 },
	card: { background: "var(--bg-elevated)", border: "1px solid var(--divider)", borderRadius: 14, overflow: "hidden" },
	tableScroll: { width: "100%", overflowX: "auto" },
	table: { width: "100%", borderCollapse: "collapse", minWidth: 760 },
	th: {
		textAlign: "left", padding: "14px 18px", fontFamily: "var(--font-nav)",
		fontSize: 10, letterSpacing: "0.14em", color: "var(--text-muted)",
		borderBottom: "1px solid var(--divider)", whiteSpace: "nowrap",
	},
	td: {
		padding: "13px 18px", fontFamily: "var(--font-body)", fontSize: 13,
		color: "var(--text-secondary)", borderBottom: "1px solid var(--divider)", whiteSpace: "nowrap",
	},
	mono: { fontFamily: "var(--font-nav)", fontSize: 12, color: "var(--text-primary)" },
	pill: {
		display: "inline-block", padding: "3px 10px", borderRadius: 999,
		fontFamily: "var(--font-nav)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
	},
	muted: { color: "var(--text-muted)" },
	state: { padding: "60px 20px", textAlign: "center", fontFamily: "var(--font-nav)", fontSize: 13, letterSpacing: "0.12em", color: "var(--text-muted)" },
	denyState: { padding: "80px 20px", textAlign: "center", fontFamily: "var(--font-nav)", fontSize: 14, letterSpacing: "0.1em", color: "var(--danger)" },
}

function fmtTime(ts) {
	if (!ts) return "\u2014"
	const d = new Date(ts)
	return isNaN(d) ? ts : d.toLocaleString()
}

function resultPill(result) {
	const color = RESULT_COLORS[result] || "var(--text-muted)"
	const style = Object.assign({}, S.pill, {
		color,
		background: "color-mix(in srgb, " + color + " 16%, transparent)",
		border: "1px solid color-mix(in srgb, " + color + " 40%, transparent)",
	})
	return <span style={style}>{result || "\u2014"}</span>
}

export default function Audit() {
	const { can } = useAuth()
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	const isAdmin = can("manage_users")

	useEffect(() => {
		if (!isAdmin) {
			setLoading(false)
			return
		}
		let alive = true
		apiGet("/audit")
			.then((data) => {
				if (alive) setEvents(data.events || [])
			})
			.catch((err) => {
				if (alive) setError(err?.message || "Failed to load audit log")
			})
			.finally(() => {
				if (alive) setLoading(false)
			})
		return () => {
			alive = false
		}
	}, [isAdmin])

	if (!isAdmin) {
		return (
			<div style={S.wrap}>
				<div style={S.denyState}>403 \u2014 Audit trail is restricted to platform admins.</div>
			</div>
		)
	}

	return (
		<div style={S.wrap}>
			<div style={S.head}>
				<div style={S.kicker}>SECURITY</div>
				<h1 style={S.title}>Audit Trail</h1>
				<div style={S.sub}>Append-only record of every action across the platform. Showing the 100 most recent events.</div>
			</div>

			<div style={S.card}>
				{loading ? (
					<div style={S.state}>LOADING AUDIT LOG\u2026</div>
				) : error ? (
					<div style={S.state}>{error}</div>
				) : events.length === 0 ? (
					<div style={S.state}>NO EVENTS RECORDED YET</div>
				) : (
					<div style={S.tableScroll}>
						<table style={S.table}>
							<thead>
								<tr>
									<th style={S.th}>TIME</th>
									<th style={S.th}>ACTOR</th>
									<th style={S.th}>ROLE</th>
									<th style={S.th}>ACTION</th>
									<th style={S.th}>TARGET</th>
									<th style={S.th}>NAMESPACE</th>
									<th style={S.th}>RESULT</th>
								</tr>
							</thead>
							<tbody>
								{events.map((ev) => (
									<tr key={ev.id}>
										<td style={Object.assign({}, S.td, S.muted)}>{fmtTime(ev.ts)}</td>
										<td style={Object.assign({}, S.td, S.mono)}>{ev.actor_email}</td>
										<td style={S.td}>{ev.actor_role || "\u2014"}</td>
										<td style={Object.assign({}, S.td, S.mono)}>{ev.action}</td>
										<td style={S.td}>{ev.target || "\u2014"}</td>
										<td style={S.td}>{ev.namespace || "\u2014"}</td>
										<td style={S.td}>{resultPill(ev.result)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}