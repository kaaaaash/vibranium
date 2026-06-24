// DEMO / SHOWCASE MODE — when VITE_DEMO === "true" the app runs with NO backend:
// auth is faked and every API call is served from this in-memory mock.

export const DEMO = import.meta.env.VITE_DEMO === "true"

// Persona visitors browse as (platform-admin => every button is usable)
export const DEMO_USER = {
  email: "demo@gmail.com",
  name: "Demo Explorer",
  picture: "",
  role: "platform-admin",
  team: "platform",
  namespace: "team-infra",
  permissions: ["view", "deploy", "rollback", "monitor", "manage_users"],
  is_admin: true,
}
export const DEMO_TOKEN = "demo-token"

const TEAMS = [
  { name: "team-payments", display: "Payments" },
  { name: "team-auth", display: "Auth" },
  { name: "team-gateway", display: "Gateway" },
  { name: "team-infra", display: "Infra" },
]

const CANARY_WEIGHTS = [20, 40, 60, 80, 100]
const ROLLOUT_SECONDS = 12 // how long a healthy canary takes to finish
const img = (tag = "1.0") => `gcr.io/google-samples/hello-app:${tag}`

function seed() {
  const t = Date.now() - 60_000 // finished a minute ago
  return [
    { name: "payments-api", namespace: "team-payments", image: img(), desired: 3, deployedAt: t, healthy: true },
    { name: "auth-service", namespace: "team-auth",     image: img(), desired: 2, deployedAt: t, healthy: true },
    { name: "gateway",      namespace: "team-gateway",  image: img(), desired: 2, deployedAt: t, healthy: true },
  ]
}
let SERVICES = seed()
const find = (name) => SERVICES.find((s) => s.name === name)
const isBadImage = (image = "") => /9\.9\.9|bad|broken|nope/i.test(image)

function statusOf(svc) {
  const elapsed = (Date.now() - svc.deployedAt) / 1000
  if (!svc.healthy)
    return build(svc, "Degraded", 1, 20, Math.max(svc.desired - 1, 0), "ImagePullBackOff: canary pods unhealthy")
  if (elapsed >= ROLLOUT_SECONDS)
    return build(svc, "Healthy", CANARY_WEIGHTS.length, 100, svc.desired,
      svc.rolledBack ? "Stable version restored after rollback" : "Rollout complete")
  const i = Math.min(Math.floor((elapsed / ROLLOUT_SECONDS) * CANARY_WEIGHTS.length), CANARY_WEIGHTS.length - 1)
  const ready = Math.max(1, Math.round((CANARY_WEIGHTS[i] / 100) * svc.desired))
  return build(svc, "Progressing", i + 1, CANARY_WEIGHTS[i], ready, "Canary in progress")
}

function build(svc, phase, step, weight, ready, message) {
  return {
    name: svc.name, namespace: svc.namespace, image: svc.image, phase,
    replicas: { desired: svc.desired, ready, available: ready, updated: ready },
    canary: { current_step: step, total_steps: CANARY_WEIGHTS.length, weight },
    conditions: [
      { type: "Available", status: phase === "Degraded" ? "False" : "True",
        reason: phase === "Degraded" ? "MinimumReplicasUnavailable" : "MinimumReplicasAvailable" },
      { type: "Progressing", status: phase === "Degraded" ? "False" : "True",
        reason: phase === "Healthy" ? "NewReplicaSetAvailable" : "ReplicaSetUpdated" },
    ],
    message,
  }
}

const listItem = (s) => { const st = statusOf(s); return { name: s.name, namespace: s.namespace, phase: st.phase, ready: st.replicas.ready, desired: s.desired } }
const links = () => ({ grafana: "#", prometheus: "#", kiali: "#" })
function metricsOf(svc) {
  const bad = statusOf(svc).phase === "Degraded"
  return { service: svc.name, namespace: svc.namespace,
    metrics: { request_rate: bad ? 4.2 : 128.7, error_rate: bad ? 6.1 : 0.02, p99_latency: bad ? 1.84 : 0.122 },
    note: "demo metrics", links: links() }
}

export async function handleMock(method, path, body) {
  const clean = path.split("?")[0]
  const m = method.toUpperCase()
  await new Promise((r) => setTimeout(r, 220)) // tiny latency so spinners show

  if (clean === "/auth/me") return DEMO_USER
  if (clean === "/teams") return { teams: TEAMS }
  if (clean === "/services" && m === "GET") return { services: SERVICES.map(listItem) }

  if (clean === "/services" && m === "POST") {
    const team = (body?.team || "payments").replace(/^team-/, "")
    const svc = { name: body?.name || "new-service", namespace: `team-${team}`,
      image: body?.image || img(), desired: body?.replicas || 2, deployedAt: Date.now(), healthy: !isBadImage(body?.image) }
    SERVICES = [svc, ...SERVICES.filter((s) => s.name !== svc.name)]
    return { status: "deployed", service: svc.name, team: svc.namespace, resources: ["Namespace", "Service", "Deployment", "Rollout"] }
  }

  const parts = clean.split("/").filter(Boolean) // ["services", name, action?]
  if (parts[0] === "services" && parts[1]) {
    const name = decodeURIComponent(parts[1])
    const action = parts[2]
    let svc = find(name)

    if (action === "deploy" && m === "POST") {
      if (!svc) { svc = { name, namespace: "team-payments", desired: 3 }; SERVICES.unshift(svc) }
      svc.image = body?.image || svc.image; svc.deployedAt = Date.now()
      svc.healthy = !isBadImage(svc.image); svc.rolledBack = false
      return { status: "rollout triggered", service: name, image: svc.image }
    }
    if (action === "rollback" && m === "POST") {
      if (svc) { svc.healthy = true; svc.image = img(); svc.rolledBack = true; svc.deployedAt = Date.now() - ROLLOUT_SECONDS * 1000 }
      return { status: "rollback initiated", service: name, detail: `rollout/${name} aborted — stable version restored` }
    }
    if (!svc) return { detail: `Rollout '${name}' not found` }
    if (action === "metrics") return metricsOf(svc)
    if (action === "monitor") return { service: name, namespace: svc.namespace, rollout_phase: statusOf(svc).phase, monitoring: links() }
    return statusOf(svc) // /rollout or bare /services/:name
  }
  return {} // anything else -> harmless empty success
}