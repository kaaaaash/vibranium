# VIBRANIUM — HANDOVER (Day 6B)

**Date:** 2026-06-13
**Status:** Auth + RBAC fully shipped end-to-end. 3 visual upgrades shipped (smoke bg, fused navbar, display cards, magnetic deploy button). Full homepage + dashboard = tomorrow.
**Predecessors:** HANDOVER_DAY5.md, HANDOVER_DAY6A.md

> NOTE: All secrets / IDs in this doc are redacted as <PLACEHOLDERS>. Real values live in local env exports / a password manager / GCP console — NEVER commit them.

---

## TL;DR — what Day 6B delivered

1. **Identity & access** — Google OAuth login + company-domain allowlist. No more "anyone can spin up stuff."
2. **RBAC** — server-side enforcement (real lock) + client-side UX gating (hide/show). Roles: viewer / developer / sre / platform-admin.
3. **Token-wired data layer** — `lib/api.js` puts a Bearer token on every backend call; Catalog / Deploy / RolloutDetails all go through it.
4. **Visual pass** — living smoke background, navbar fused into homepage hero, fanned service "display cards," magnetic Deploy CTA.

---

## AUTH (backend)

**`backend/auth.py`**
- Reads env: `GOOGLE_CLIENT_ID`, `VIB_JWT_SECRET`. (Keep `import os` — still needed for these.)
- `ALLOWED_DOMAINS = [<company-domain>, <test-domain>]` — **hardcoded for local testing.** Env export is currently ignored. FLIP BACK to env-reading before cluster deploy.
- `VIB_JWT_ALGO = "HS256"`, `VIB_JWT_TTL = 8h`.
- `USERS` map (email -> role/team): <admin-email> (platform-admin/platform), <sre-email> (sre/payments), <dev-email> (developer/payments), <your-test-email> (platform-admin/platform).
- `DEFAULT_ROLE = "developer"`, `DEFAULT_TEAM = "payments"` (unknown allowed-domain users land here).
- `ROLE_PERMISSIONS`:
  - viewer: [view]
  - developer: [view, deploy]
  - sre: [view, deploy, rollback, monitor]
  - platform-admin: [view, deploy, rollback, monitor, manage_users]
- `TEAM_NAMESPACE`: payments->team-payments, auth->team-auth, gateway->team-gateway, infra->team-infra, platform->team-infra.
- Router prefix `/auth`. Endpoints: `POST /auth/login` (Google token in -> VIB JWT + profile out), `GET /auth/me`.
- Helpers: `_verify_google_token` (clock_skew 10s), `_build_profile`, `_issue_vib_jwt` (iat/exp/iss="vibranium"), `get_current_user`, `require_permission(perm)`.

**`backend/main.py` (v0.5.0)**
- `from auth import router as auth_router, get_current_user, require_permission`.
- `resolve_namespace(user, namespace=None)` — maps user/team to k8s namespace; admins can target any.
- Route guards:
  - Public: `/`, `/health`
  - get_current_user: `/teams`
  - require deploy: `POST /namespaces`, `POST /services`, `/deploy`
  - require view: `GET /services` (filtered to user namespace unless admin), `/services/{name}`, `/rollout`, `/metrics`
  - require rollback: `/rollback`
  - require monitor: `/monitor`
- CORS `allow_headers=["*"]`.
- Health: `GET /health` -> {"status":"vibranium is live","version":"0.5.0"}.

---

## AUTH + RBAC (frontend)

- **`context/AuthContext.jsx`** — `TOKEN_KEY="vib_token"`; `login(googleCredential)` POSTs `/auth/login`; hydrates `/auth/me` on token change; `logout()`; `can(perm)`; exposes { user, token, loading, error, login, logout, can, isAuthed }.
- **`lib/api.js`** — base `import.meta.env.VITE_API || "http://localhost:8001"`; `authHeaders()`, `apiFetch(path, options)` (adds Content-Type + Bearer; on 401 clears token, redirects /login, throws), `apiGet`, `apiPost` (surfaces backend `detail`).
- **`pages/Login.jsx` / `Login.css`** — "Platform Access" gate, Google button, deep-red brand panel.
- **`pages/Profile.jsx` / `Profile.css`** — "Identity & Permissions" / big "Access." heading; identity card + Sign Out; ROLE/TEAM/SCOPE badges; capabilities check-list (view/deploy/rollback/monitor/manage_users); environment access; session info (iat/exp/iss). Route `/profile`.
- **`components/Navbar.jsx`** — avatar pill (role + picture/initial) -> dropdown (name, role-team, PROFILE, SIGN OUT), outside-click close; `LINKS` filtered by `can()`. **Now route-aware:** transparent + translucent crimson veil/blur on `/` (homepage) so it fuses with the hero; solid blurred bar on all inner pages.
- **`main.jsx`** — StrictMode -> GoogleOAuthProvider -> BrowserRouter -> AuthProvider -> App.
- **`App.jsx`** — AuthSplash while loading; `!isAuthed` -> /login; intro Loader once; authed routes incl `/profile`; NotFound last.
- **RBAC client gating** — `RolloutDetails.jsx` gates DEPLOY NEW IMAGE behind `can('deploy')`, ROLLBACK behind `can('rollback')`, shows "READ-ONLY ACCESS" when neither. Server still enforces regardless (client gating is cosmetic).

Data pages all wired through `lib/api.js`:
- **`Catalog.jsx`** -> `apiGet('/services')`
- **`Deploy.jsx`** -> `apiPost('/services', {...})`
- **`RolloutDetails.jsx`** -> `apiFetch(API + ...)` for load / rollback / deployImage

---

## VISUAL UPGRADES (Day 6B evening)

1. **`components/VibraniumDust.jsx`** — full-bleed WebGL **smoke shader** (domain-warped fbm noise) recolored deep-red -> gold -> cream, mix-blend: screen, opacity ~0.75. Homepage hero only, pointer-events: none, disabled on prefers-reduced-motion. Dials: `opacity` in CANVAS_STYLE, `u_time * 0.05` (speed), `uv * 3.0` (swirl size).
2. **Navbar fusion** — see Navbar above. Homepage nav = transparent + crimson veil (~0.45 alpha) + blur(4px) so the smoke flows through it subtly = one connected surface. (Scrim div removed.)
3. **`components/DisplayCards.jsx` / `DisplayCards.css`** — fanned/overlapping service cards (CATALOG / DEPLOY / OBSERVE / RECOVER); stacked at rest, spread on stack-hover, each lifts + gold-glow + ENTER arrow on hover; routes via `useNavigate`. Currently previewed on Homepage; **needs proper placement in tomorrow's full homepage** (fan needs horizontal room — clips on left in the temp spot).
4. **`components/MagneticButton.jsx`** — wraps the Deploy CTA; gold particles gather into the button + subtle magnetic pull toward cursor. Gated to pointer: fine and non-reduced-motion (else plain button). Used in `Deploy.jsx` (<MagneticButton baseStyle={cta} ...>); old `ctaIn`/`ctaOut` now unused.

---

## CURRENT RUNTIME STATE

- **EKS cluster is DOWN** (destroyed/unreachable — kubectl NXDOMAIN). All work is against a **local backend on port 8001**.
- Catalog showing "UPLINK FAILED — FAILED TO FETCH" is EXPECTED (no cluster). It is NOT a 401 — token wiring is confirmed working.
- Logged in locally as the test account (platform-admin).

### Run the backend (local)
```
cd ~/vibranium/backend
source .venv/bin/activate
export GOOGLE_CLIENT_ID=<gcp-oauth-client-id>
export VIB_JWT_SECRET=<your-local-secret>
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```
- (ALLOWED_DOMAINS export no longer needed — hardcoded.)
- Health: http://localhost:8001/health  | Docs: http://localhost:8001/docs
- venv exists because of PEP 668 (externally-managed). Each new terminal: re-source .venv/bin/activate + re-export.

### Run the frontend
```
cd ~/vibranium/frontend
npm run dev   # Vite on 5173
```

### Frontend env — `frontend/.env` (DO NOT COMMIT)
```
VITE_GOOGLE_CLIENT_ID=<gcp-oauth-client-id>
VITE_API=http://localhost:8001
```

### GCP OAuth
- Project: <gcp-project>. Client ID: stored in GCP console / local env. Consent screen = Testing.
- Authorized JS origins: http://localhost:5173, http://127.0.0.1:5173
- Test user: <your-test-email>

> SECURITY: do NOT commit `VIB_JWT_SECRET`, the OAuth client ID, or `.env` to git. Keep secrets in local exports / a password manager. Ensure `.env` is in `.gitignore`.

---

## KNOWN ISSUES / WATCH-OUTS

- `ALLOWED_DOMAINS` is hardcoded — fine for local, **flip back to env-reading before deploying to the cluster.**
- Display cards clip on the left in the temporary homepage preview — placement gets fixed with the real homepage layout.
- OBSERVE + RECOVER cards currently route to `/catalog` as placeholders (no dedicated routes yet).
- Dashboard route exists in the navbar but the page isn't built yet.
- Backend env vars (GOOGLE_CLIENT_ID, VIB_JWT_SECRET) must be added to `backend-deployment.yaml` before the cluster deploy — via k8s secrets, not plaintext.

---

## TOMORROW (Day 7 plan)

1. **Build the full Homepage** — proper layout, place the DisplayCards fan with room to spread, integrate hero + smoke + cards cohesively.
2. **Build the Dashboard** (`Dashboard.jsx`) — overview cards.
3. Rewire OBSERVE / RECOVER card routes to real destinations.
4. **Deploy backend to cluster** (when ready): terraform apply to rebuild EKS -> add the env vars to `backend-deployment.yaml` (as secrets) -> rebuild image -> ECR -> kubectl rollout restart -n team-infra. Flip ALLOWED_DOMAINS back to env.
5. **Test full RBAC flow** — add a viewer/developer to `USERS` to actually see gated UI (DEPLOY hidden in navbar, READ-ONLY in cockpit).
6. Wire Loader into route transitions; consider a run.sh to bundle backend startup.
7. **Git push** once Day 6B is stable (confirm .env + secrets are gitignored first).
8. Sweep any remaining "Wakandan / Directorate" copy -> "Platform Engineering" / "Vibranium Control Plane."

---

## QUICK REFERENCE

- **Ports:** frontend 5173, backend 8001 (local), backend svc 8000 in-cluster.
- **EKS:** cluster `vibranium-cluster`, region `ap-south-1`, account <aws-account-id>, backend ns `team-infra`. (Currently destroyed.)
- **Team -> Namespace:** Payments->team-payments, Auth->team-auth, Gateway->team-gateway, Infra->team-infra.
- **Design tokens:** bg #840000, bg-card #6b0000, bg-elevated #4f0000, text #F8F4F0 / #D7C6C6 / #A98F8F, border #9B3A3A, accent #E6D2A2 (hover #F2E5C5), success #4CAF82, warning #E8A838, danger #E85050, info #6FA8DC. Fonts: TAN Buster (hero), Clash Grotesk (nav), Satoshi (body).
- **Branding:** "VIB." wordmark, tagline "DEPLOY. OBSERVE. RECOVER." No Wakanda lore on serious surfaces.
- **JWT flow:** Google login -> POST /auth/login {token} -> {access_token, user} -> store as vib_token -> Bearer on every request -> backend decodes.
