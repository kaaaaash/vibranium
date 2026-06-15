# vibranium — day 6A handover
**date:** 12 june 2026
**author:** aaroh seth (kaaaaash)
**status:** day 6A complete — full frontend page set shipped, real end-to-end deploy validated through the portal, destroyed for the night
**build time:** ~one long session (a lot of ground)

---

## what got done today

day 6A was the big frontend push. the portal now drives a **real** argo rollout on EKS, end to end, from a button click.

### pages built

| page | route | status | result |
|------|-------|--------|--------|
| catalog | `/catalog` | ✅ | service grid, hover-lift cards, 30s poll |
| deploy wizard (v5) | `/deploy` | ✅ | name, group, image, port, replica slider, env vars, canary toggle |
| deployment success | `/deployed` | ✅ NEW | checkmark draw + gold particle burst + staggered reveal |
| rollout details (cockpit) | `/services/:name` | ✅ | live 5s poll, status badge, canary progress, replica tiles, rollback + deploy-new-image, raw status |
| 404 | `*` | ✅ NEW | RGB-glitch "transmission lost / return to command" |

navbar (logo 52px, gold active pill) + loader already in place from before.

### the money-shot flow

```
click service → DEPLOY wizard → POST /services → SUCCESS animation → VIEW SERVICE → live cockpit
```

confirmed working with a real rollout (`payment-api`, `payment-v2`) on EKS. this is the demo flow. everyone remembers the success animation.

> **interview answer:** "the deploy button isn't a mock — it provisions a namespace, service, deployment, and an argo rollout on a live EKS cluster, then polls real rollout status. the success screen is just the bow on a real pipeline."

### rollout status — the real shape (and the crash it caused)

```json
{
  "name": "payment-v2",
  "namespace": "team-payments",
  "phase": "Healthy",
  "replicas": { "desired": 2, "ready": 2, "available": 2, "updated": 2 },
  "canary":   { "current_step": 8, "total_steps": 8, "weight": "7c57b4fc59" },
  "conditions": [ ... ],
  "message": ""
}
```

two gotchas baked into the cockpit now:
- `replicas` is a nested **object**, not a number. rendering it directly = the "objects are not valid as a react child" crash. fixed with a normalizer + a `show()` guard.
- `canary.weight` is a **pod-template-hash**, NOT traffic %. real progress = `current_step / total_steps`. cockpit title reads `STEP 8 / 8`.

---

## bugs hit and fixed

| bug | cause | fix |
|-----|-------|-----|
| cockpit crash on view / blank after deploy | `replicas` object rendered as a react child | normalize nested fields + `show()` guard on all dynamic values |
| canary bar showed garbage | used `canary.weight` (a hash) as % | switched to `current_step / total_steps` |
| 404 = blank white page on EVERY route | `NotFound` imported twice in `App.jsx` → syntax error → no default export | de-duped the import + the duplicate `*` route |
| `borderColor` rerender warning | shorthand `border` conflicting with `borderColor` override | gave the last meta cell its own `cellLast` style |
| catalog "failed to fetch" earlier | dead port-forward (cluster had been destroyed) | re-ran bring-up runbook, port-forward back up |

---

## full route surface (end of day 6A)

| route | page | notes |
|-------|------|-------|
| `/` | homepage | needs polish (day 6B) |
| `/catalog` | catalog | live, 30s poll |
| `/deploy` | deploy wizard | POSTs to `:8001/services` |
| `/deployed` | success screen | NEW — redirected to on deploy success |
| `/services/:name` | rollout cockpit | live, 5s poll |
| `/dashboard` | dashboard | stub — build last |
| `*` | 404 | NEW — catch-all, must stay last |

frontend file map: `src/pages/{Homepage,Catalog,Deploy,DeploymentSuccess,RolloutDetails,Dashboard,NotFound}.jsx` (+ matching `.css` for Deploy, Catalog, RolloutDetails, DeploymentSuccess, NotFound). `src/components/{Navbar,Loader}.jsx`.

**code rule:** no double-curly in JSX. `const S = {...}` + `style={S.x}` + named handlers. CSS files for pseudo-selectors / keyframes.

---

## first thing tomorrow (day 6B)

```bash
# 1. spin up cluster (was destroyed overnight)
cd ~/vibranium/infra/terraform
terraform apply

# 2. configure kubectl
aws eks update-kubeconfig --region ap-south-1 --name vibranium-cluster
kubectl get nodes

# 3. argo rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# 4. backend namespace + rbac + backend
kubectl create namespace team-infra 2>/dev/null || true
kubectl apply -f ~/vibranium/backend/rbac.yaml
kubectl apply -f ~/vibranium/backend/backend-deployment.yaml

# 5. port-forward (keep this tab open)
kubectl port-forward svc/vibranium-backend 8001:8000 -n team-infra &
curl http://localhost:8001/services

# 6. frontend
cd ~/vibranium/frontend
npm run dev
```

---

## day 6B goals (the visual pass)

portal is structurally DONE but visually FLAT. tomorrow = depth, motion, atmosphere. locked priority order:

1. **3D hero** — rotating vibranium shard / cluster orb behind the homepage hero. `npm i three @react-three/fiber @react-three/drei`. lazy-load the canvas so it never blocks first paint.
2. **ambient FX** — film grain overlay, drifting gradient-mesh glow, faint scanlines, vignette, cursor spotlight that tracks the mouse.
3. **micro-interactions** — magnetic buttons, count-up metric numbers, scroll reveals (IntersectionObserver).

### uiverse harvesting (VIB-ify everything: maroon/gold tokens, our fonts)

| component | ref | status |
|-----------|-----|--------|
| secondary button | `byllzz/rude-bat-50` | unused — pull tomorrow |
| checkbox | `00Kubi/hot-dragonfly-56` | unused — use for deploy's 4 toggles |
| CTA | `bandirevanth/wonderful-dog-56` | build native |

aaroh will drop more links as he finds them. adapt anything that fits the mission-control vibe.

### still on the todo list

- **dashboard** (LAST) — sidebar + overview cards: total services, healthy, cluster status, errors (degraded + aborted)
- homepage polish + primary/secondary VIB-native buttons
- wire loader into route transitions (warp)
- deploy wizard rework: 4 toggles (monitoring, rollbacks, auto_recovery, canary) → extend POST body + backend `ServiceCreateRequest`
- backend: add `image` to `get_rollout_status` so the cockpit IMAGE tile fills (shows `—` right now)
- catalog cards: enrich replicas/image (list endpoint payload is light)
- **git:** NOT pushed yet (intentional). push when day 6B is stable.

### guardrails for the visual pass
- respect `prefers-reduced-motion`
- lazy-load 3D, keep the bundle lean
- decoration must never break the real data flows already working

---

## container images for canary testing

| image | port | notes |
|-------|------|-------|
| `gcr.io/google-samples/hello-app:1.0` → `:2.0` | 8080 | shows version text — ideal for watching canary climb 20→40→60→80→100 |
| `traefik/whoami` | 80 | fallback |
| `nginxdemos/hello` | 80 | fallback |

---

## architecture decisions updated

| decision | choice | reason |
|----------|--------|--------|
| frontend | react + react-router, plain JSX + CSS | no double-curly mangling, full control |
| inline styles | `const S = {...}` objects | avoids ` ` issues, readable |
| canary % source | `current_step / total_steps` | `weight` is a hash, not traffic |
| structure first | flows before decoration | don't polish a corpse — visuals are day 6B |
| git push | deferred | push when 6B build is stable |

---

## day-by-day plan

| day | codename | goal |
|-----|----------|------|
| day 0 | mise en place | done ✓ |
| day 1 | recon | done ✓ |
| day 2 | foundation | done ✓ |
| day 3 | manifest engine | done ✓ |
| day 4 | shadow link | done ✓ |
| day 5 | harvey link | done ✓ |
| **day 6A** | **portal — page set** | **done ✓ — catalog, deploy, success, cockpit, 404, real e2e deploy** |
| day 6B | portal — visual pass | 3D hero, ambient FX, micro-interactions, dashboard |
| day 7 | integration | e2e testing, chaos, screenshots, case study |
| day 8 | buffer | polish, docs, github readme, GIF |
| day 9 | prometheus | kube-prometheus-stack, live metrics, harvey connection |

---

## cost guardrails
- billing alert at $40
- hard cap: $50/month
- nightly destroy mandatory → `cd ~/vibranium/infra/terraform && terraform destroy`
- rbac binding recreated each morning
- confirm gone: `aws eks list-clusters --region ap-south-1`

---

*wakanda forever. the portal is alive and it deploys for real. tomorrow we make it glow.*
