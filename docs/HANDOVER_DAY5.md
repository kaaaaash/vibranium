# vibranium — day 5 handover
**date:** 10 june 2026
**author:** aaroh seth (kaaaaash)
**status:** day 5 complete — harvey link endpoints live, metrics graceful fallback working, destroyed for the night
**build time:** ~1 hour (excluding 15 min terraform apply)

---

## what got done today

### harvey integration — link generation

two new endpoints live and verified:

| endpoint | method | status | result |
|----------|--------|--------|--------|
| `/services/{name}/monitor` | GET | ✅ | rollout phase + grafana + prometheus + kiali links |
| `/services/{name}/metrics` | GET | ✅ | live prometheus query attempt, graceful null fallback |

### monitor endpoint — actual output

```json
{
  "service": "payment-service",
  "namespace": "team-payments",
  "rollout_phase": "Healthy",
  "monitoring": {
    "grafana": "http://grafana.harvey.svc.cluster.local:3000/d/vibranium-service?var-service=payment-service&var-namespace=team-payments",
    "prometheus": "http://prometheus.harvey.svc.cluster.local:9090/graph?g0.expr=rate(http_requests_total{service%3D%22payment-service%22}[5m])&g0.tab=0",
    "kiali": "http://kiali.harvey.svc.cluster.local:20001/kiali/console/namespaces/team-payments/services/payment-service"
  }
}
```

### metrics endpoint — actual output

```json
{
  "service": "payment-service",
  "namespace": "team-payments",
  "metrics": {
    "request_rate": null,
    "error_rate": null,
    "p99_latency": null
  },
  "note": "null values indicate Prometheus not reachable in this environment — links are live",
  "links": {
    "grafana": "...",
    "prometheus": "...",
    "kiali": "..."
  }
}
```

### why null metrics is the correct answer

Prometheus is not deployed on this dev cluster — Harvey runs as a separate project.
the endpoint attempts a live query with a 2-second timeout and degrades gracefully.
in production with Harvey connected, these return real values.
the links are constructed correctly regardless.

> **interview answer:** "Vibranium doesn't run its own Prometheus — it links to Harvey, which is the dedicated observability layer. Each project has one job. That separation is the portfolio arc."

### prometheus wiring — deferred to day 9

kube-prometheus-stack is heavy for t3.small (Prometheus + Grafana + Alertmanager + node-exporter).
decision: install on day 9 (buffer day) when the full demo is already working.
story is stronger — demo Vibranium end-to-end first, then show live Harvey metrics as the capstone.

---

## what was added to k8s_client.py

```python
# Harvey URLs — points to Harvey cluster when connected
HARVEY_URLS = {
    "grafana": "http://grafana.harvey.svc.cluster.local:3000",
    "prometheus": "http://prometheus.harvey.svc.cluster.local:9090",
    "kiali": "http://kiali.harvey.svc.cluster.local:20001",
}

def get_harvey_links(name, namespace) -> dict   # pre-filtered links per service
def get_service_metrics(name, namespace) -> dict  # live query + graceful fallback
```

## what was added to main.py

```python
GET /services/{name}/monitor   # rollout phase + all 3 harvey links
GET /services/{name}/metrics   # prometheus query + fallback + links
```

---

## bugs hit and fixed

| bug | cause | fix |
|-----|-------|-----|
| `port-forward: service does not have port 80` | backend service exposes 8000, not 80 | `kubectl port-forward svc/vibranium-backend 8001:8000 -n team-infra` |
| `rollout_phase: Unknown` on first monitor call | payment-service not yet deployed on fresh cluster | deployed payment-service first, phase returned `Healthy` correctly |

---

## full api surface (end of day 5)

| endpoint | method | description |
|----------|--------|-------------|
| `/` | GET | welcome |
| `/health` | GET | backend health check |
| `/teams` | GET | list all teams |
| `/namespaces` | POST | create namespace |
| `/services` | GET | service catalog — all rollouts |
| `/services` | POST | create + deploy new service |
| `/services/{name}` | GET | service detail + rollout status |
| `/services/{name}/rollout` | GET | live rollout phase, steps, replicas |
| `/services/{name}/deploy` | POST | trigger new canary by patching image |
| `/services/{name}/rollback` | POST | abort canary, restore stable |
| `/services/{name}/monitor` | GET | rollout phase + harvey links ← day 5 |
| `/services/{name}/metrics` | GET | prometheus metrics + fallback ← day 5 |

backend is feature complete. day 6 is frontend only.

---

## first thing tomorrow (day 6)

```bash
# 1. spin up cluster
cd ~/vibranium/infra/terraform
terraform apply

# 2. configure kubectl
aws eks update-kubeconfig --region ap-south-1 --name vibranium-cluster
kubectl get nodes

# 3. argo rollouts
kubectl create namespace argo-rollouts 2>/dev/null || true
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# 4. ecr
aws ecr create-repository --repository-name vibranium-test --region ap-south-1 2>/dev/null || true

# 5. backend
kubectl create namespace team-infra 2>/dev/null || true
kubectl apply -f ~/vibranium/backend/backend-deployment.yaml

# 6. rbac — do not skip this
kubectl create clusterrolebinding vibranium-admin \
  --clusterrole=cluster-admin \
  --serviceaccount=team-infra:default

# 7. verify everything
kubectl get pods -A

# 8. port forward
kubectl port-forward svc/vibranium-backend 8001:8000 -n team-infra &
curl http://localhost:8001/health

# 9. start day 6 — react frontend
cd ~/vibranium/frontend
```

---

## day 6 goals (portal)

- react 18 + tailwind setup
- react router — 3 pages: catalog, create, rollout view
- **catalog page** — table of all services, live status badges, monitor + rollback buttons
- **create wizard** — form: name, team, image, port, replicas → POST /services
- **rollout view** — live canary progress, step tracker, rollback button
- backend API calls via axios or fetch
- polling every 5s for rollout status (react query or setInterval)
- dark theme — matches vibranium aesthetic

---

## architecture decisions updated

| decision | choice | reason |
|----------|--------|--------|
| manifest engine | kubernetes SDK | locked day 4 |
| harvey integration | link generation + graceful fallback | Prometheus not on dev cluster — correct separation |
| live prometheus | deferred to day 9 | t3.small memory risk, day 6 is higher priority |
| metrics null values | explicit + documented | honest > fake data |
| backend | feature complete | all 12 endpoints live and verified |

---

## day-by-day plan

| day | codename | goal |
|-----|----------|------|
| day 0 | mise en place | done ✓ |
| day 1 | recon | done ✓ |
| day 2 | foundation | done ✓ |
| day 3 | manifest engine | done ✓ |
| day 4 | shadow link | done ✓ |
| **day 5** | **harvey link** | **done ✓ — monitor + metrics endpoints, graceful fallback** |
| day 6 | portal | react frontend — catalog, create wizard, rollout view |
| day 7 | integration | e2e testing, chaos, screenshots, case study |
| day 8 | buffer | polish, docs, github readme, GIF |
| day 9 | prometheus | kube-prometheus-stack, live metrics, harvey connection |

---

## cost guardrails
- billing alert at $40
- hard cap: $50/month
- nightly destroy mandatory
- ECR recreated each morning
- RBAC binding recreated each morning

---

*wakanda forever. backend is done. tomorrow we build what people see.*
