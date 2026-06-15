import { useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Loader from "./components/Loader"
import PageTransition from "./components/PageTransition"
import Login from "./pages/Login"
import Homepage from "./pages/Homepage"
import Catalog from "./pages/Catalog"
import Deploy from "./pages/Deploy"
import DeploymentSuccess from "./pages/DeploymentSuccess"
import RolloutDetails from "./pages/RolloutDetails"
import Dashboard from "./pages/Dashboard"
import NotFound from "./pages/NotFound"
import Profile from "./pages/Profile"

const S = {
	shell: { minHeight: "100vh", backgroundColor: "var(--bg)" },
	splash: {
		minHeight: "100vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "var(--bg)",
		color: "var(--accent)",
		fontFamily: "var(--font-nav, sans-serif)",
		letterSpacing: "3px",
		fontSize: "13px",
	},
}

function AuthSplash() {
	return <div style={S.splash}>AUTHENTICATING…</div>
}

export default function App() {
	const { isAuthed, loading } = useAuth()
	const [intro, setIntro] = useState(true)

	// 1. Still confirming the saved token with the backend
	if (loading) return <AuthSplash />

	// 2. Logged out -> only the login screen is reachable
	if (!isAuthed) {
		return (
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		)
	}

	// 3. Logged in -> play the intro loader once
	if (intro) return <Loader onComplete={() => setIntro(false)} />

	// 4. The real app
	return (
		<div style={S.shell}>
			<Navbar />
			<PageTransition>
				<Routes>
					<Route path="/login" element={<Navigate to="/" replace />} />
					<Route path="/" element={<Homepage />} />
					<Route path="/catalog" element={<Catalog />} />
					<Route path="/deploy" element={<Deploy />} />
					<Route path="/deployed" element={<DeploymentSuccess />} />
					<Route path="/services/:name" element={<RolloutDetails />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</PageTransition>
		</div>
	)
}