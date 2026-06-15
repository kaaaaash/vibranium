const API = import.meta.env.VITE_API || "http://localhost:8001"
const TOKEN_KEY = "vib_token"

// attach the VIB token if we have one
export function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// core wrapper: adds auth + JSON headers, kicks you to /login on 401
export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API}${path}`
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(options.headers || {}),
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    if (window.location.pathname !== "/login") {
      window.location.assign("/login")
    }
    throw new Error("Session expired. Please sign in again.")
  }

  return res
}

// GET -> parsed JSON
export async function apiGet(path) {
  const res = await apiFetch(path)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

// POST -> parsed JSON, surfaces backend "detail" messages (e.g. 403 reasons)
export async function apiPost(path, body) {
  const res = await apiFetch(path, { method: "POST", body: JSON.stringify(body) })
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data && data.detail) detail = data.detail
    } catch (e) {}
    throw new Error(detail)
  }
  return res.json()
}