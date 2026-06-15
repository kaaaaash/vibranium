import { useState, useEffect } from "react"
import DashboardSidebar from "../components/DashboardSidebar"
import DashboardStats from "../components/DashboardStats"
import DashboardBody from "../components/DashboardBody"
import DashboardFooterRow from "../components/DashboardFooterRow"
import DeploymentsChart from "../components/DeploymentsChart"

const S = {
	shell: { display: "flex", minHeight: "100vh", background: "var(--bg)" },
	main: { flex: 1, minWidth: 0, padding: "40px 48px" },
	mainMobile: { padding: "76px 18px 40px" },
}

export default function Dashboard() {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 760px)")
		function onChange() {
			setIsMobile(mq.matches)
		}
		onChange()
		mq.addEventListener("change", onChange)
		return () => mq.removeEventListener("change", onChange)
	}, [])

	const mainStyle = isMobile ? Object.assign({}, S.main, S.mainMobile) : S.main

	return (
		<div style={S.shell}>
			<DashboardSidebar />
			<main style={mainStyle}>
				<DashboardStats />
				<DashboardBody />
				<DashboardFooterRow />
				<DeploymentsChart />
			</main>
		</div>
	)
}