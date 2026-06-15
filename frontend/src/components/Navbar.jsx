import { useState, useRef, useEffect } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const LINKS = [
	{ to: "/dashboard", label: "DASHBOARD", perm: "view" },
	{ to: "/catalog", label: "CATALOG", perm: "view" },
	{ to: "/deploy", label: "DEPLOY", perm: "deploy" },
]

const ROLE_LABELS = {
	"platform-admin": "Platform Admin",
	sre: "SRE",
	developer: "Developer",
	viewer: "Viewer",
}

const NAV_TRANSITION = "background 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease"

const S = {
	nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(132,0,0,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--divider)", transition: NAV_TRANSITION },
	navHome: { position: "sticky", top: 0, zIndex: 100, background: "rgba(132,0,0,0.30)", backdropFilter: "blur(4px)", borderBottom: "1px solid transparent", transition: NAV_TRANSITION },
	inner: { position: "relative", zIndex: 1, maxWidth: "1280px", margin: "0 auto", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
	logo: { height: "52px", display: "block" },
	row: { display: "flex", gap: "10px", alignItems: "center" },
	reset: { textDecoration: "none" },
	base: { fontFamily: "var(--font-nav)", fontSize: "12px", letterSpacing: "0.16em", padding: "9px 16px", borderRadius: "var(--radius)", border: "1px solid transparent", transition: "all 0.15s ease", display: "inline-block" },
	active: { color: "var(--accent)", fontWeight: 700, background: "rgba(230,210,162,0.1)", borderColor: "var(--accent)" },
	idle: { color: "var(--text-muted)", fontWeight: 500 },
	userWrap: { position: "relative" },
	avatarBtn: { display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid var(--divider)", borderRadius: "999px", padding: "4px 4px 4px 12px", cursor: "pointer" },
	avatarBtnHome: { background: "rgba(40,0,0,0.35)", backdropFilter: "blur(6px)", border: "1px solid rgba(230,210,162,0.35)" },
	avatarRole: { fontFamily: "var(--font-nav)", fontSize: "11px", letterSpacing: "0.12em", color: "var(--accent)" },
	avatarImg: { width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--accent)" },
	avatarFallback: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", color: "var(--accent)", fontFamily: "var(--font-hero)", fontSize: "15px", border: "1px solid var(--accent)" },
	menu: { position: "absolute", top: "calc(100% + 10px)", right: 0, minWidth: "220px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "8px", boxShadow: "0 12px 40px rgba(0,0,0,0.45)" },
	menuHead: { padding: "10px 12px", borderBottom: "1px solid var(--divider)", marginBottom: "6px" },
	menuName: { color: "var(--text-primary)", fontSize: "14px", fontWeight: 600 },
	menuMeta: { color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" },
	menuItem: { display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: "9px", fontFamily: "var(--font-nav)", fontSize: "12px", letterSpacing: "0.1em", color: "var(--text-secondary)", textDecoration: "none", background: "transparent", border: "none", cursor: "pointer" },
	menuSignout: { color: "var(--danger)", fontWeight: 600 },
	hamburger: { display: "flex", flexDirection: "column", gap: 5, background: "transparent", border: "1px solid var(--divider)", borderRadius: 10, cursor: "pointer", padding: "10px 9px" },
	bar: { width: 22, height: 2, background: "var(--accent)", display: "block", borderRadius: 2 },
	mobilePanel: { position: "absolute", top: "100%", left: 0, right: 0, zIndex: 99, background: "var(--bg-card)", borderTop: "1px solid var(--divider)", borderBottom: "1px solid var(--border)", padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 16px 40px rgba(0,0,0,0.45)" },
	mobileLink: { display: "block", fontFamily: "var(--font-nav)", fontSize: 13, letterSpacing: "0.14em", padding: "13px 12px", borderRadius: 10, textDecoration: "none", color: "var(--text-secondary)", border: "1px solid transparent" },
	mobileLinkActive: { color: "var(--accent)", background: "rgba(230,210,162,0.1)", borderColor: "var(--accent)", fontWeight: 700 },
	mobileUser: { display: "flex", alignItems: "center", gap: 10, padding: "13px 12px", borderTop: "1px solid var(--divider)", marginTop: 8 },
	mobileSignout: { textAlign: "left", width: "100%", background: "transparent", border: "none", cursor: "pointer", color: "var(--danger)", fontFamily: "var(--font-nav)", fontSize: 13, letterSpacing: "0.14em", padding: "13px 12px", fontWeight: 600 },
}

export default function Navbar() {
	const { user, logout, can } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [open, setOpen] = useState(false)
	const [scrolled, setScrolled] = useState(false)
	const [isMobile, setIsMobile] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const wrapRef = useRef(null)
	const isHome = location.pathname === "/"

	useEffect(() => {
		function onClick(e) {
			if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
		}
		document.addEventListener("mousedown", onClick)
		return () => document.removeEventListener("mousedown", onClick)
	}, [])

	useEffect(() => {
		function onScroll() {
			setScrolled(window.scrollY > 24)
		}
		onScroll()
		window.addEventListener("scroll", onScroll, { passive: true })
		return () => window.removeEventListener("scroll", onScroll)
	}, [])

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 760px)")
		function onChange() {
			setIsMobile(mq.matches)
		}
		onChange()
		mq.addEventListener("change", onChange)
		return () => mq.removeEventListener("change", onChange)
	}, [])

	// close any open menus on navigation
	useEffect(() => {
		setOpen(false)
		setMenuOpen(false)
	}, [location.pathname])

	// ✅ guard still sits AFTER every hook
	if (location.pathname.startsWith("/dashboard")) return null

	const links = LINKS.filter((l) => !l.perm || (can ? can(l.perm) : true))
	const roleLabel = user ? ROLE_LABELS[user.role] || user.role : ""
	const initial = ((user?.name || user?.email || "?").trim().charAt(0) || "?").toUpperCase()
	const atTop = isHome && !scrolled

	function handleSignOut() {
		setOpen(false)
		setMenuOpen(false)
		logout()
		navigate("/login", { replace: true })
	}

	function navEnter(e) {
		if (e.currentTarget.dataset.active === "true") return
		e.currentTarget.style.color = "var(--accent)"
		e.currentTarget.style.background = "rgba(230,210,162,0.06)"
		e.currentTarget.style.borderColor = "rgba(230,210,162,0.25)"
	}
	function navLeave(e) {
		if (e.currentTarget.dataset.active === "true") return
		e.currentTarget.style.color = "var(--text-muted)"
		e.currentTarget.style.background = "transparent"
		e.currentTarget.style.borderColor = "transparent"
	}

	const avatarBtnStyle = atTop
		? Object.assign({}, S.avatarBtn, S.avatarBtnHome)
		: S.avatarBtn

	const avatarNode = user && user.picture ? (
		<img src={user.picture} alt={user.name} style={S.avatarImg} referrerPolicy="no-referrer" />
	) : (
		<span style={S.avatarFallback}>{initial}</span>
	)

	return (
		<nav style={atTop ? S.navHome : S.nav}>
			<div style={S.inner}>
				<NavLink to="/" style={S.reset}>
					<img src="/logo.png" alt="VIB." style={S.logo} />
				</NavLink>

				{isMobile ? (
					<button style={S.hamburger} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
						<span style={S.bar} />
						<span style={S.bar} />
						<span style={S.bar} />
					</button>
				) : (
					<div style={S.row}>
						{links.map((l) => (
							<NavLink key={l.to} to={l.to} style={S.reset}>
								{({ isActive }) => (
									<span
										data-active={isActive ? "true" : "false"}
										style={Object.assign({}, S.base, isActive ? S.active : S.idle)}
										onMouseEnter={navEnter}
										onMouseLeave={navLeave}
									>
										{(isActive ? "● " : "") + l.label}
									</span>
								)}
							</NavLink>
						))}
						{user && (
							<div style={S.userWrap} ref={wrapRef}>
								<button style={avatarBtnStyle} onClick={() => setOpen((v) => !v)}>
									<span style={S.avatarRole}>{roleLabel}</span>
									{avatarNode}
								</button>
								{open && (
									<div style={S.menu}>
										<div style={S.menuHead}>
											<div style={S.menuName}>{user.name}</div>
											<div style={S.menuMeta}>{roleLabel} · {user.team}</div>
										</div>
										<NavLink to="/profile" style={S.menuItem} onClick={() => setOpen(false)}>
											PROFILE
										</NavLink>
										<button style={Object.assign({}, S.menuItem, S.menuSignout)} onClick={handleSignOut}>
											SIGN OUT
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{isMobile && menuOpen && (
				<div style={S.mobilePanel}>
					{links.map((l) => {
						const active = location.pathname === l.to
						return (
							<NavLink
								key={l.to}
								to={l.to}
								style={active ? Object.assign({}, S.mobileLink, S.mobileLinkActive) : S.mobileLink}
							>
								{(active ? "● " : "") + l.label}
							</NavLink>
						)
					})}
					{user && (
						<>
							<div style={S.mobileUser}>
								{avatarNode}
								<div>
									<div style={S.menuName}>{user.name}</div>
									<div style={S.menuMeta}>{roleLabel} · {user.team}</div>
								</div>
							</div>
							<NavLink to="/profile" style={S.mobileLink}>
								PROFILE
							</NavLink>
							<button style={S.mobileSignout} onClick={handleSignOut}>
								SIGN OUT
							</button>
						</>
					)}
				</div>
			)}
		</nav>
	)
}