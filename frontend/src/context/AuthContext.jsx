import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { DEMO, DEMO_USER, DEMO_TOKEN } from "../lib/demo"

const API = import.meta.env.VITE_API || "http://localhost:8001"
const TOKEN_KEY = "vib_token"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => DEMO ? DEMO_TOKEN : (localStorage.getItem(TOKEN_KEY) || ""))
  const [user, setUser] = useState(DEMO ? DEMO_USER : null)
  const [loading, setLoading] = useState(!DEMO)
  const [error, setError] = useState("")

  // On load (or whenever the token changes), confirm it with the backend.
  useEffect(() => {
    if (DEMO) {
      setUser(DEMO_USER)
      setLoading(false)
      return
    }

    let cancelled = false

    async function hydrate() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(API + "/auth/me", {
          headers: { Authorization: "Bearer " + token },
        })
        if (!res.ok) throw new Error("session invalid")
        const profile = await res.json()
        if (!cancelled) setUser(profile)
      } catch (e) {
        // bad/expired token -> wipe it
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken("")
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [token])

  // Exchange a Google ID token for a VIB token (backend is the source of truth).
  const login = useCallback(async (googleCredential) => {
    if (DEMO) {
      localStorage.setItem(TOKEN_KEY, DEMO_TOKEN)
      setUser(DEMO_USER)
      setToken(DEMO_TOKEN)
      return DEMO_USER
    }

    setError("")
    const res = await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleCredential }),
    })
    if (!res.ok) {
      let detail = "Login failed"
      try {
        detail = (await res.json()).detail || detail
      } catch (e) {}
      setError(detail)
      throw new Error(detail)
    }
    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setUser(data.user)
    setToken(data.access_token)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken("")
    setUser(null)
  }, [])

  // Frontend RBAC = UX only. Backend still enforces everything.
  const can = useCallback(
    (perm) => !!user && (user.permissions || []).includes(perm),
    [user]
  )

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    can,
    isAuthed: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}