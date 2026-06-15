import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Profile.css"

const ROLE_LABELS = {
  "platform-admin": "Platform Admin",
  sre: "SRE",
  developer: "Developer",
  viewer: "Viewer",
}

// every capability VIB knows about, in display order
const ALL_CAPABILITIES = [
  { key: "view", label: "View Services" },
  { key: "deploy", label: "Deploy Services" },
  { key: "rollback", label: "Rollback Services" },
  { key: "monitor", label: "Monitoring & Metrics" },
  { key: "manage_users", label: "Platform Administration" },
]

// environment access derived from role (deterministic, not fabricated data)
function envAccess(role) {
  if (role === "platform-admin" || role === "sre")
    return { Production: true, Staging: true, Development: true }
  if (role === "developer")
    return { Production: false, Staging: true, Development: true }
  return { Production: false, Staging: false, Development: true }
}

function fmtTime(epochSeconds) {
  if (!epochSeconds) return "—"
  try {
    return new Date(epochSeconds * 1000).toLocaleString()
  } catch (e) {
    return "—"
  }
}

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const perms = useMemo(() => new Set(user?.permissions || []), [user])

  if (!user) return null

  const roleLabel = ROLE_LABELS[user.role] || user.role
  const initials = (user.name || user.email || "?").trim().charAt(0).toUpperCase()
  const env = envAccess(user.role)

  function handleSignOut() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="pf-wrap">
      <div className="pf-head">
        <div className="pf-eyebrow">IDENTITY &amp; PERMISSIONS</div>
        <h1 className="pf-h1">Access.</h1>
      </div>

      <div className="pf-card pf-identity">
        {user.picture ? (
          <img
            className="pf-avatar"
            src={user.picture}
            alt={user.name}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="pf-avatar pf-avatar-fallback">{initials}</div>
        )}
        <div className="pf-id-text">
          <div className="pf-name">{user.name}</div>
          <div className="pf-role-line">{roleLabel}</div>
          <div className="pf-email">{user.email}</div>
        </div>
        <button className="pf-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <div className="pf-badge-row">
        <div className="pf-card pf-badge">
          <div className="pf-badge-label">ROLE</div>
          <div className={"pf-badge-value pf-role-" + user.role}>{roleLabel}</div>
        </div>
        <div className="pf-card pf-badge">
          <div className="pf-badge-label">TEAM</div>
          <div className="pf-badge-value">{user.team}</div>
        </div>
        <div className="pf-card pf-badge">
          <div className="pf-badge-label">SCOPE</div>
          <div className="pf-badge-value">
            {user.is_admin ? "all namespaces" : user.namespace}
          </div>
        </div>
      </div>

      <div className="pf-card">
        <div className="pf-section-title">Capabilities</div>
        <ul className="pf-caps">
          {ALL_CAPABILITIES.map((c) => {
            const has = perms.has(c.key)
            return (
              <li key={c.key} className={has ? "pf-cap pf-cap-on" : "pf-cap pf-cap-off"}>
                <span className="pf-cap-mark">{has ? "✓" : "✗"}</span>
                {c.label}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="pf-card">
        <div className="pf-section-title">Environment Access</div>
        <div className="pf-envs">
          {Object.keys(env).map((name) => (
            <div
              key={name}
              className={env[name] ? "pf-env pf-env-on" : "pf-env pf-env-off"}
            >
              <span className="pf-cap-mark">{env[name] ? "✓" : "✗"}</span>
              {name}
            </div>
          ))}
        </div>
      </div>

      <div className="pf-card pf-session">
        <div className="pf-section-title">Session</div>
        <div className="pf-kv"><span>Authenticated via</span><strong>Google</strong></div>
        <div className="pf-kv"><span>Issued</span><strong>{fmtTime(user.iat)}</strong></div>
        <div className="pf-kv"><span>Expires</span><strong>{fmtTime(user.exp)}</strong></div>
        <div className="pf-kv"><span>Issuer</span><strong>{user.iss || "vibranium"}</strong></div>
      </div>

      <div className="pf-footnote">
        🔒 Roles &amp; permissions are assigned server-side and embedded in a
        VIB-signed token. This page is read-only — identity is owned by Google,
        authorization by VIB.
      </div>
    </div>
  )
}