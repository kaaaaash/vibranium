import { useLocation } from "react-router-dom"
import "./PageTransition.css"

export default function PageTransition({ children }) {
	const { pathname } = useLocation()
	// keying by pathname remounts on every route change, re-triggering the fade
	return (
		<div key={pathname} className="vib-page">
			{children}
		</div>
	)
}