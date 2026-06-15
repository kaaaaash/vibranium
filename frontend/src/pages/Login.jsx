import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import { useAuth } from "../context/AuthContext"
import "./Login.css"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSuccess(credentialResponse) {
    setError("")
    setBusy(true)
    try {
      await login(credentialResponse.credential)
      navigate("/", { replace: true })
    } catch (e) {
      setError(e.message || "Access denied")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-grid" />
      <div className="login-card">
        <div className="login-mark">
          VIB<span>.</span>
        </div>
        <div className="login-tag">DEPLOY. OBSERVE. RECOVER.</div>
        <div className="login-divider" />
        <h1 className="login-title">Platform Access</h1>
        <p className="login-sub">
         Authenticate with your company account to enter the control plane.
        </p>

        <div className="login-btn-wrap">
          {busy ? (
            <div className="login-busy">VERIFYING IDENTITY…</div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("Google sign-in was cancelled or failed.")}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="280"
            />
          )}
        </div>

        {error && <div className="login-error">⛔ {error}</div>}

        <div className="login-foot">
          <span className="login-lock">🔒</span> SSO via Google · RBAC enforced
          server-side
        </div>
      </div>
    </div>
  )
}