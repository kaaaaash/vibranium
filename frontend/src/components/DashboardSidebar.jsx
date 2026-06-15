import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const NAV = [
	{ to: "/dashboard", label: "Dashboard", icon: "\u25A0" },
	{ to: "/catalog", label: "Service Catalog", icon: "\u25A4" },
	{ to: "/deploy", label: "Deploy", icon: "\u25B2" },
]

const S = {
	aside: {
		width: 248, flexShrink: 0,
		height: "100vh", alignSelf: "flex-start",
		position: "sticky", top: 0, overflowY: "auto",
		background: "var(--bg-elevated)", borderRight: "1px solid var(--divider)",
		display: "flex", flexDirection: "column", padding: "28px 18px",
	},
	drawerBase: {
		position: "fixed", top: 0, left: 0, zIndex: 80,
		width: 264, height: "100vh",
		transition: "transform 0.28s ease", boxShadow: "4px 0 40px rgba(0,0,0,0.5)",
	},
	drawerOpen: { transform: "translateX(0)" },
	drawerClosed: { transform: "translateX(-100%)" },
	topbar: {
		position: "fixed", top: 0, left: 0, right: 0, height: 56, zIndex: 60,
		display: "flex", alignItems: "center", justifyContent: "space-between",
		padding: "0 18px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--divider)",
	},
	topbarBrandLink: { textDecoration: "none" },
	topbarWordmark: { fontFamily: "var(--font-hero)", fontSize: 22, color: "var(--accent)", lineHeight: 1 },
	hamburger: { display: "flex", flexDirection: "column", gap: 4, background: "transparent", border: "1px solid var(--divider)", borderRadius: 9, padding: "9px 8px", cursor: "pointer" },
	bar: { width: 20, height: 2, background: "var(--accent)", borderRadius: 2, display: "block" },
	backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", zIndex: 70 },
	brandLink: { textDecoration: "none", display: "block", transition: "opacity 0.18s ease" },
	brand: { display: "flex", flexDirection: "column", gap: 4, padding: "0 10px 28px" },
	wordmark: { fontFamily: "var(--font-hero)", fontSize: 30, color: "var(--accent)", lineHeight: 1 },
	brandSub: { fontFamily: "var(--font-nav)", fontSize: 9, letterSpacing: "0.22em", color: "var(--text-muted)" },
	menuLabel: { fontFamily: "var(--font-nav)", fontSize: 10, letterSpacing: "0.2em", color: "var(--text-muted)", padding: "0 10px", marginBottom: 10 },
	nav: { display: "flex", flexDirection: "column", gap: 4 },
	link: {
		display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10,
		fontFamily: "var(--font-nav)", fontSize: 14, color: "var(--text-secondary)",
		textDecoration: "none", background: "transparent", transition: "all 0.18s ease",
	},
	linkActive: {
		display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10,
		fontFamily: "var(--font-nav)", fontSize: 14, color: "var(--accent)",
		textDecoration: "none", background: "rgba(230,210,162,0.12)", transition: "all 0.18s ease",
	},
	icon: { fontSize: 13, width: 16, textAlign: "center" },
	spacer: { flex: 1 },
	userLink: {
		display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 10,
		borderTop: "1px solid var(--divider)", marginTop: 12,
		textDecoration: "none", cursor: "pointer", background: "transparent",
		transition: "background 0.18s ease",
	},
	avatar: {
		width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
		background: "var(--accent)", color: "var(--bg)", display: "flex",
		alignItems: "center", justifyContent: "center",
		fontFamily: "var(--font-nav)", fontSize: 15, fontWeight: 700,
	},
	avatarImg: {
		width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
		objectFit: "cover", border: "1px solid var(--accent)",
	},
	userMeta: { display: "flex", flexDirection: "column", minWidth: 0 },
	userName: { fontFamily: "var(--font-nav)", fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
	userRole: { fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" },
	logout: {
		marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "transparent",
		border: "1px solid var(--border)", color: "var(--text-secondary)",
		fontFamily: "var(--font-nav)", fontSize: 12, cursor: "pointer",
		transition: "all 0.18s ease", letterSpacing: "0.05em",
	},
}

export default function DashboardSidebar() {
	const { pathname } = useLocation()
	const { user, logout } = useAuth()
	const [isMobile, setIsMobile] = useState(false)
	const [drawerOpen, setDrawerOpen] = useState(false)

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 760px)")
		function onChange() {
			setIsMobile(mq.matches)
		}
		onChange()
		mq.addEventListener("change", onChange)
		return () => mq.removeEventListener("change", onChange)
	}, [])

	useEffect(() => {
		setDrawerOpen(false)
	}, [pathname])

	const email = user?.email || ""
	const name = user?.name || (email ? email.split("@")[0] : "User")
	const role = user?.role || "viewer"
	const initial = (name[0] || "U").toUpperCase()
	const avatarUrl = user?.picture || user?.avatar || user?.image || ""

	const closeDrawer = () => setDrawerOpen(false)

	function linkEnter(e) {
		if (e.currentTarget.dataset.active === "true") return
		e.currentTarget.style.background = "rgba(230,210,162,0.08)"
		e.currentTarget.style.color = "var(--accent)"
	}
	function linkLeave(e) {
		if (e.currentTarget.dataset.active === "true") return
		e.currentTarget.style.background = "transparent"
		e.currentTarget.style.color = "var(--text-secondary)"
	}
	function userEnter(e) { e.currentTarget.style.background = "rgba(230,210,162,0.06)" }
	function userLeave(e) { e.currentTarget.style.background = "transparent" }
	function logoutEnter(e) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }
	function logoutLeave(e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }
	function brandEnter(e) { e.currentTarget.style.opacity = "0.7" }
	function brandLeave(e) { e.currentTarget.style.opacity = "1" }

	const inner = (
		<>
			<Link to="/" style={S.brandLink} onMouseEnter={brandEnter} onMouseLeave={brandLeave} onClick={closeDrawer}>
				<div style={S.brand}>
					<span style={S.wordmark}>VIB.</span>
					<span style={S.brandSub}>PLATFORM CONSOLE</span>
				</div>
			</Link>
			<div style={S.menuLabel}>MENU</div>
			<nav style={S.nav}>
				{NAV.map((item) => {
					const active = pathname === item.to
					return (
						<Link
							key={item.to}
							to={item.to}
							data-active={active ? "true" : "false"}
							style={active ? S.linkActive : S.link}
							onMouseEnter={linkEnter}
							onMouseLeave={linkLeave}
							onClick={closeDrawer}
						>
							<span style={S.icon}>{item.icon}</span>
							{item.label}
						</Link>
					)
				})}
			</nav>
			<div style={S.spacer} />
			<Link to="/profile" style={S.userLink} onMouseEnter={userEnter} onMouseLeave={userLeave} onClick={closeDrawer}>
				{avatarUrl ? (
					<img src={avatarUrl} alt={name} style={S.avatarImg} referrerPolicy="no-referrer" />
				) : (
					<div style={S.avatar}>{initial}</div>
				)}
				<div style={S.userMeta}>
					<span style={S.userName}>{name}</span>
					<span style={S.userRole}>{role}</span>
				</div>
			</Link>
			<button style={S.logout} onClick={logout} onMouseEnter={logoutEnter} onMouseLeave={logoutLeave}>
				Log out
			</button>
		</>
	)

	if (isMobile) {
		const drawerStyle = Object.assign(
			{},
			S.aside,
			S.drawerBase,
			drawerOpen ? S.drawerOpen : S.drawerClosed,
		)
		return (
			<>
				<div style={S.topbar}>
					<Link to="/" style={S.topbarBrandLink}>
						<span style={S.topbarWordmark}>VIB.</span>
					</Link>
					<button style={S.hamburger} onClick={() => setDrawerOpen(true)} aria-label="Menu">
						<span style={S.bar} />
						<span style={S.bar} />
						<span style={S.bar} />
					</button>
				</div>
				{drawerOpen && <div style={S.backdrop} onClick={closeDrawer} />}
				<aside style={drawerStyle}>{inner}</aside>
			</>
		)
	}

	return <aside style={S.aside}>{inner}</aside>
}