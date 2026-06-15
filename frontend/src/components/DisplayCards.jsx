import { useNavigate } from "react-router-dom"
import "./DisplayCards.css"

const CARDS = [
	{ key: "catalog", label: "CATALOG", desc: "Browse every running service", to: "/catalog", icon: "▦" },
	{ key: "deploy", label: "DEPLOY", desc: "Ship a new service live", to: "/deploy", icon: "▲" },
	{ key: "observe", label: "OBSERVE", desc: "Watch rollouts and health", to: "/dashboard", icon: "◎" },
	{ key: "recover", label: "RECOVER", desc: "Pick a service to roll back", to: "/catalog", icon: "↺" },
]

export default function DisplayCards() {
	const navigate = useNavigate()
	return (
		<div className="dc-stack">
			{CARDS.map((c) => (
				<button key={c.key} className="dc-card" onClick={() => navigate(c.to)}>
					<span className="dc-icon">{c.icon}</span>
					<span className="dc-label">{c.label}</span>
					<span className="dc-desc">{c.desc}</span>
					<span className="dc-go">ENTER →</span>
				</button>
			))}
		</div>
	)
}