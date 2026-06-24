import { useState, useEffect } from "react"
import { apiGet } from "../lib/api"

// Dot color: failures/denials are always red; otherwise color by action.
function eventColor(ev) {
	if (ev.result === "failure" || ev.result === "denied") return "var(--danger)"
	switch (ev.action) {
		case "deploy":
			return "var(--accent)"
		case "rollback":
			return "var(--warning)"
		case "create_service":
		case "create_namespace":
			return "var(--success)"
		case "login":
			return "var(--info)"
		default:
			return "var(--text-muted)"
	}
}

// Turn a raw audit row into a human sentence.
function describe(ev) {
	const t = ev.target || ""
	switch (ev.action) {
		case "login":
			return ev.result === "success" ? "Signed in" : "Sign-in " + ev.result
		case "deploy":
			return (t ? t : "Service") + " deploy " + (ev.result || "")
		case "rollback":
			return (t ? t : "Service") + " rollback " + (ev.result || "")
		case "create_service":
			return (t ? t : "Service") + " created"
		case "create_namespace":
			return "Namespace " + t + " created"
		case "access_denied":
			return "Access denied" + (t ? ": " + t : "")
		default:
			return (ev.action + (t ? " " + t : "")).trim()
	}
}

function fmtTime(ts) {
	if (!ts) return "\u2014"
	const d = new Date(ts)
	return isNaN(d) ? ts : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function dotStyle(ev) {
	return {
		width: "8px",
		height: "8px",
		borderRadius: "50%",
		flexShrink: 0,
		background: eventColor(ev),
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
	state: {
		fontFamily: "var(--font-nav)",
		fontSize: "13px",
		letterSpacing: "0.12em",
		color: "var(--text-muted)",
		padding: "18px 8px",
		borderBottom: "1px solid var(--divider)",
	},
}

export default function ActivityFeed() {
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let alive = true
		apiGet("/audit/me")
			.then((data) => {
				if (alive) setEvents(data.events || [])
			})
			.catch(() => {
				if (alive) setEvents([])
			})
			.finally(() => {
				if (alive) setLoading(false)
			})
		return () => {
			alive = false
		}
	}, [])

	return (
		<section style={S.section}>
			<p style={S.kicker}>RECENT ACTIVITY</p>
			<div style={S.feed}>
				{loading ? (
					<div style={S.state}>LOADING ACTIVITY\u2026</div>
				) : events.length === 0 ? (
					<div style={S.state}>NO RECENT ACTIVITY YET</div>
				) : (
					events.map((ev) => (
						<div style={S.row} key={ev.id}>
							<span style={dotStyle(ev)} />
							<span style={S.time}>{fmtTime(ev.ts)}</span>
							<span style={S.text}>{describe(ev)}</span>
							<span style={S.meta}>{ev.namespace || ev.result || ""}</span>
						</div>
					))
				)}
			</div>
		</section>
	)
}