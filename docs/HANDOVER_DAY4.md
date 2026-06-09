# vibranium — day 4 handover
**date:** 9 june 2026
**author:** aaroh seth (kaaaaash)
**status:** day 4 complete — rollout APIs live, catalog working, rollback tested, destroyed for the night
**build time:** ~2 hours (excluding 15 min terraform apply)

---

## what got done today

### option B+ — SDK-direct resource builders

helm binary removed from the container entirely.
no subprocess. no chart path. no YAML files on disk.

every kubernetes resource is now built and applied in pure Python:

| resource | builder function | SDK call |
|----------|-----------------|----------|
| Namespace | `create_namespace()` | `CoreV1Api.create_namespace()` |
| Service | `create_service()` | `CoreV1Api.create_namespaced_service()` |
| Deployment | `create_deployment()` | `AppsV1Api.create_namespaced_deployment()` |
| Rollout | `create_rollout()` | `CustomObjectsApi.create_namespaced_custom_object()` |

### new endpoints — day 4

| endpoint | method | status | result |
|----------|--------|--------|--------|
| `/services` | GET | ✅ | service catalog — all rollouts across all namespaces |
| `/services/{name}` | GET | ✅ | single service detail + rollout status |
| `/services/{name}/rollout` | GET | ✅ | live rollout phase, step index, replica counts |
| `/services/{name}/deploy` | POST | ✅ | triggers new canary by patching rollout image |
| `/services/{name}/rollback` | POST | ✅ | aborts canary, restores stable |

### rollout canary config (baked into Python)

```python
ROLLOUT_CANARY_STEPS = [
    {"setWeight": 20},
    {"pause": {"duration": "30s"}},
    {"setWeight": 40},
    {"pause": {"duration": "30s"}},
    {"setWeight": 60},
    {"pause": {"duration": "30s"}},
    {"setWeight": 80},
    {"pause": {"duration": "30s"}},
]
```

every service deployed through vibranium inherits this — developer never touches it.

### rollout status response — actual output from today

```json
{
    "name": "payment-service",
    "namespace": "team-payments",
    "phase": "Healthy",
    "replicas": {
        "desired": 2,
        "ready": 2,
        "available": 2,
        "updated": 2
    },
    "canary": {
        "current_step": 8,
        "total_steps": 8,
        "weight": "6db58c5d5d"
    },
    "conditions": [
        {"type": "Completed", "status": "True", "reason": "RolloutCompleted"},
        {"type": "Healthy", "status": "True", "reason": "RolloutHealthy"},
        {"type": "Progressing", "status": "True", "reason": "NewReplicaSetAvailable"},
        {"type": "Available", "status": "True", "reason": "AvailableReason"}
    ],
    "message": ""
}
```

### rollback

```bash
curl -X POST http://localhost:8001/services/payment-service/rollback?namespace=team-payments
```

sets `spec.abort: true` on the Rollout — argo takes it from there, stable pods restore full traffic.

---

## why B+ is the better interview answer

**interviewer:** "why not keep Helm in the container?"

**answer:** "Helm is great for templating and distribution. But when you own the platform end-to-end, the Kubernetes Python SDK gives you programmatic resource creation with type safety, error handling, and no binary dependency. Helm charts stay in the repo as the canonical reference for how resources should look — the platform builds them dynamically. That's a cleaner separation."

---

## bugs hit and fixed

| bug | cause | fix |
|-----|-------|-----|
| `POST /services` returned empty reply | 500 inside pod, looked like day 3 helm issue | checked logs — was actually RBAC, not helm |
| `ForbiddenException 403` on `create_namespace` | backend SA `system:serviceaccount:team-infra:default` had no cluster-scope permissions | `kubectl create clusterrolebinding vibranium-admin --clusterrole=cluster-admin --serviceaccount=team-infra:default` |
| ECR repo already exists on morning apply | terraform destroy doesn't wipe ECR if it was created manually | swallowed the error — `2>/dev/null \|\| true` in startup script |
| 4 pods on first deploy (2 stable + 2 canary) | Argo Rollout created canary pods alongside existing Deployment pods | expected behaviour — Argo manages the transition, both sets healthy |
| `ApiException 409` on re-deploy | resource already exists from prior run | added `if e.status == 409: return "already exists"` in all builders |
| rollback patch body | wrong structure attempted first | correct field is `spec.abort: true` — Argo handles the rest |

> **note for day 5:** RBAC binding (`vibranium-admin`) is not persisted — cluster is destroyed nightly. add it to the morning checklist.

---

## project structure (end of day 4)

```
vibranium/
├── frontend/
├── backend/
│   ├── main.py              ← 8 endpoints, B+ architecture
│   ├── k8s_client.py        ← all SDK builders here
│   ├── requirements.txt
│   ├── Dockerfile           ← no helm binary
│   ├── .dockerignore
│   └── backend-deployment.yaml
├── helm/
│   └── vibranium-chart/     ← reference only, not used at runtime
├── infra/
│   └── terraform/
├── docs/
└── README.md
```

---

## first thing tomorrow (day 5)

```bash
cd ~/vibranium/infra/terraform
terraform apply

aws eks update-kubeconfig --region ap-south-1 --name vibranium-cluster
kubectl get nodes

kubectl create namespace argo-rollouts 2>/dev/null || true
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

aws ecr create-repository --repository-name vibranium-test --region ap-south-1 2>/dev/null || true

kubectl create namespace team-infra 2>/dev/null || true
kubectl apply -f ~/vibranium/backend/backend-deployment.yaml

kubectl get pods -A

# IMPORTANT — rebind cluster-admin every morning (destroyed with cluster)
kubectl create clusterrolebinding vibranium-admin \
  --clusterrole=cluster-admin \
  --serviceaccount=team-infra:default
```

---

## day 5 goals (harvey link)

- `GET /services/{name}/metrics` — query prometheus for service metrics
- grafana dashboard link generation per service
- kiali service graph link per namespace
- `ServiceMonitor` resource builder added to `k8s_client.py`
- backend returns full harvey links alongside rollout status

---

## architecture decisions updated

| decision | choice | reason |
|----------|--------|--------|
| manifest engine | **kubernetes SDK** (day 4 switch) | no binary dependency, programmatic, testable |
| helm charts | kept as reference | documents canonical resource shape, not used at runtime |
| rollback mechanism | `spec.abort: true` patch | correct Argo API — clean canary abort |
| resource idempotency | 409 swallowed as "already exists" | safe to re-run POST /services |
| canary steps | hardcoded in Python | platform enforces consistent strategy, developer can't misconfigure |

---

## day-by-day plan

| day | codename | goal |
|-----|----------|------|
| day 0 | mise en place | done ✓ |
| day 1 | recon | done ✓ |
| day 2 | foundation | done ✓ |
| day 3 | manifest engine | done ✓ |
| **day 4** | **shadow link** | **done ✓ — rollout trigger, status, rollback** |
| day 5 | harvey link | prometheus metrics, grafana + kiali links |
| day 6 | portal | react frontend — wizard, catalog, rollout view |
| day 7 | integration | e2e testing, chaos, screenshots, case study |
| day 8 | buffer | polish, docs, github readme, GIF |

---

## cost guardrails
- billing alert at $40
- hard cap: $50/month
- nightly destroy mandatory
- ECR recreated each morning (1 command)

---

*wakanda forever. the platform now controls its own deployments.*