# VIBRANIUM (VIB) — Handover: Day 6C & 6D

> Internal Developer Platform for EKS/Kubernetes — **Deploy. Observe. Recover.**
> React (Vite) frontend + FastAPI backend. Theme: dark crimson `#840000` + gold `#E6D2A2`.
> Project root: `~/vibranium` (frontend `~/vibranium/frontend`, backend `~/vibranium/backend`).

---

## Status at end of Day 6D

- **Day 6C — FULL HOMEPAGE:** DONE.
- **Day 6D — Chic Dashboard + Polish A–F:** DONE.
- **Codebase is lore-free** (no Wakanda references on serious surfaces).
- **Ready to push to GitHub** — `.env`, `.env.local`, `.venv/`, `node_modules/` all gitignored; no secrets staged.

---

## Day 6C — Full Homepage

Composed `pages/Homepage.jsx` from modular components:

- **Hero** — "VIBRANIUM." wordmark anchored bottom, tagline "DEPLOY. OBSERVE. RECOVER."
- **StatusStrip** — live-ish status pills (`.vib-dot` pulse in StatusStrip.css).
- **Intro** copy block.
- **DisplayCards** — Quick Actions: Catalog, Deploy, Observe, Recover.
- **FeatureGrid** — platform capabilities.
- **EnvironmentOverview** — per-environment summary (mock).
- **ActivityFeed** — recent activity (mock).
- **SecuritySection** — 5 items incl. Audit Trail.
- **ArchitectureSection** — flow diagram (→ arrows).
- **Footer** — © 2026 VIB · v0.5.0.

Supporting components: MagneticButton, VibraniumDust.

> NOTE: All homepage data widgets (StatusStrip, EnvironmentOverview, ActivityFeed) are **static mock** — EKS cluster is destroyed and there is no persistence yet. Commented for future wiring (Day 7+).

---

## Day 6D — Chic Dashboard

`pages/Dashboard.jsx` = flex shell → `<DashboardSidebar/>` + `<main>` containing:

1. **DashboardSidebar.jsx** — 248px sticky sidebar; clickable VIB. wordmark (`<Link to="/">`); MENU nav (Dashboard / Service Catalog / Deploy, gold-active); user block (avatar/initial + role) linking to `/profile`; Log out button. **Now responsive (see Polish D).**
2. **Header** — greeting + meta.
3. **DashboardStats.jsx** — 4 stat cards (Services hero gold), auto-fit grid, ↗ badges, hover lift.
4. **DashboardBody.jsx** — 2-panel: Recent Deployments (left) + Service Health (right). Mock data.
5. **DashboardFooterRow.jsx** — canary SVG ring gauge (60% PROMOTED) + live uptime card (ticks each second).
6. **DeploymentsChart.jsx** — weekly deployments bar chart (Mon–Sun), animated fill, gold bars.

All dashboard data is **static mock**, commented for future real-data wiring.

---

## Day 6D — Polish punch-list A–F (ALL DONE)

### A · Navbar
- **A1 scroll-aware background:** `scrolled` state + scroll listener; `atTop = isHome && !scrolled`; transparent crimson at top → solid blurred crimson on scroll. `NAV_TRANSITION` smoothing.
- **A2 active-link polish:** hover tint + faint border on idle links (guarded by `data-active`); active link keeps gold pill + "● " prefix.
- **Sidebar clickable logo:** wrapped brand block in `<Link to="/">` with opacity-fade hover.

### B · Routing & transitions
- Rewired DisplayCards: OBSERVE → `/dashboard`, RECOVER → `/catalog` ("Pick a service to roll back").
- **PageTransition** (`components/PageTransition.jsx` + `.css`): keyed by pathname, `vibPageIn` fade+rise 0.32s on every route. Authed `<Routes>` wrapped in `<PageTransition>`. `/profile` route moved above `*` catch-all. Loader kept as one-time login intro only (no full-loader per nav).

### C · Copy cleanup
- Grep confirmed zero lore in frontend. Only mock email domain was `wakanda.com` in `backend/auth.py` → renamed to `gmail.com`. Seed users: `aaroh@gmail.com`, `sre@gmail.com`, `dev@gmail.com`, `aaroh.seth01@gmail.com`. `ALLOWED_DOMAINS = ["gmail.com"]`.

### D · Responsive
- **D1 mobile navbar:** `matchMedia("(max-width: 760px)")` → `isMobile`; below 760px shows hamburger → full-width `mobilePanel` with stacked links + user block + PROFILE + sign out. useEffect closes menus on route change. All hooks BEFORE the `/dashboard` guard (`return null`).
- **D2 dashboard sidebar drawer:** sidebar becomes a fixed slide-in drawer (translateX) under 760px, opened from a fixed crimson top bar (hamburger + VIB. wordmark) with a tap-to-close backdrop. `Dashboard.jsx` main gains mobile top-padding (`76px 18px 40px`) so content clears the bar. Drawer auto-closes on route change.

### E · Micro-polish (global CSS, appended to `index.css`)
- Custom crimson scrollbar with gold thumb-on-hover (WebKit + Firefox).
- Gold-tinted `::selection`.
- Gold `:focus-visible` ring (accessibility).
- Smooth scroll + `prefers-reduced-motion` guard.

### F · Meta (`index.html` `<head>`)
- Tab title: `VIB · Internal Developer Platform`.
- Favicon: `/logo.png`.
- `theme-color` `#840000` + meta description + Open Graph preview tags.
- 404: `NotFound.jsx` wired to `*` catch-all (styled).

---

## Architecture snapshot

### Frontend (`~/vibranium/frontend/src/`)
- `App.jsx` — auth gate → AuthSplash / login Routes / one-time Loader / authed shell (`<Navbar/>` + `<PageTransition><Routes/></PageTransition>`).
- `context/AuthContext.jsx` — `{ user, token, loading, error, login, logout, can, isAuthed }`; `useAuth()`. `user` carries `picture`.
- `lib/api.js` — `API = import.meta.env.VITE_API || "http://localhost:8001"`; `TOKEN_KEY = "vib_token"`; `authHeaders / apiFetch / apiGet / apiPost`.
- `components/` — Navbar, Loader (+css), PageTransition (+css), VibraniumDust, DisplayCards (+css), MagneticButton, StatusStrip (+css), FeatureGrid, EnvironmentOverview, ActivityFeed, SecuritySection, ArchitectureSection, Footer, DashboardSidebar, DashboardStats, DashboardBody, DashboardFooterRow, DeploymentsChart.
- `pages/` — Homepage, Catalog, Deploy, DeploymentSuccess, RolloutDetails, Dashboard, NotFound, Login, Profile (+ .css).
- Dev: `cd ~/vibranium/frontend && npm run dev` (Vite, port 5173).

### Backend (`~/vibranium/backend/`) — v0.5.0
- `main.py` — imports `auth` router + `get_current_user`/`require_permission`; `resolve_namespace(user, namespace=None)`; `/` and `/health` public; CORS `allow_headers=["*"]`.
- `auth.py` — `APIRouter(prefix="/auth")`: POST `/auth/login`, `get_current_user`, `require_permission`, GET `/auth/me`. JWT HS256, 8h TTL. Roles: viewer / developer / sre / platform-admin. Team→namespace map.
- Run locally: `cd ~/vibranium/backend && source .venv/bin/activate`, export `GOOGLE_CLIENT_ID` + `VIB_JWT_SECRET`, then `uvicorn main:app --host 0.0.0.0 --port 8001 --reload`. Health → `{"status":"vibranium is live","version":"0.5.0"}`.

### Design tokens
- `--bg #840000`, `--bg-card #6b0000`, `--bg-elevated #4f0000`, `--text-primary #F8F4F0`, `--text-secondary #D7C6C6`, `--text-muted #A98F8F`, `--border #9B3A3A`, `--divider #7A1D1D`, `--accent #E6D2A2`, `--accent-hover #F2E5C5`, `--success #4CAF82`, `--warning #E8A838`, `--danger #E85050`, `--info #6FA8DC`.
- Fonts: TAN Buster (hero), Clash Grotesk (nav), Satoshi (body).
- Branding: "VIB." wordmark, tagline "DEPLOY. OBSERVE. RECOVER."

---

## Code conventions (IMPORTANT)
- Inline styles via a single `const S = {}` object + `style={S.x}`; merge with `Object.assign({}, base, extra)`.
- Use CSS files only for pseudo-selectors / keyframes / media-queries.
- Named hover/focus handlers (`onMouseEnter`/`onMouseLeave`), not inline arrow style mutations where avoidable.
- All React hooks must run before any conditional `return` (e.g. Navbar `/dashboard` guard sits after all hooks).
- Prefer ASCII; use `\uXXXX` escapes in JS strings for glyphs and HTML entities in JSX text.

---

## Next up (Day 7+)

1. **Audit-log DB** — VIB's first database. SQLite append-only schema (with `result`), `record_audit(...)` in each action endpoint, `GET /audit` admin-only; wire Activity Feed + Audit Trail. SQLite → Postgres later.
2. **Wire real data** — Status Strip, Environment Overview, and all Dashboard widgets need cluster up + `GET /metrics/summary` + per-namespace counts; OFFLINE fallback.
3. **Test full RBAC flow** — add `viewer` / `developer` to `USERS`.
4. **Backend deploy to cluster (later)** — terraform apply, env vars into `backend-deployment.yaml`, rebuild → ECR → `kubectl rollout restart -n team-infra`; flip `ALLOWED_DOMAINS` to env.
5. Deferred: wizard toggles → POST body + `ServiceCreateRequest`; add `image` to `get_rollout_status`; enrich Catalog cards.
6. Optional: pipe real Google `picture` claim through AuthContext for all users.

### EKS rebuild quick ref (cluster currently destroyed)
- Cluster `vibranium-cluster`, region `ap-south-1`, ns `team-infra`, svc 8000 → localhost:8001.
- `terraform apply -auto-approve` → `aws eks update-kubeconfig --name vibranium-cluster --region ap-south-1` → Argo Rollouts install.yaml → `kubectl create namespace team-infra` → rbac.yaml → backend-deployment.yaml → port-forward 8001:8000.
- Sample images: `gcr.io/google-samples/hello-app:1.0` → `:2.0` (8080); fallbacks `traefik/whoami`, `nginxdemos/hello`, `nginx:1.25→1.27`.

---

## Git push checklist (closing Day 6)
- [x] `.env`, `.env.local`, `.venv/`, `node_modules/` gitignored.
- [x] No secrets staged.
- [ ] `git add -A && git commit -m "Day 6: homepage, dashboard, responsive + polish"`.
- [ ] `git push`.

_Secrets live only in local `.env` (GCP OAuth Client ID + `VIB_JWT_SECRET`) — never commit them._

---

_End of Day 6C/6D handover._
