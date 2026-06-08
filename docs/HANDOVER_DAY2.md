# vibranium — day 2 handover
**date:** 7 june 2026  
**author:** aaroh seth (kaaaaash)  
**status:** day 2 complete — backend pod live in EKS, destroyed for the night  
**build time:** 1 hour 15 mins (excluding 15 min terraform apply)

---

## what got done today

### fastapi scaffold
- `main.py` — three endpoints live and tested
- `requirements.txt` — fastapi, uvicorn, kubernetes, pydantic, httpx
- `Dockerfile` — python:3.11-slim, uvicorn entrypoint
- `.dockerignore` — excludes `venv/`, `__pycache__/`, `*.pyc`
- `k8s_client.py` — kubernetes SDK wrapper, in-cluster + local fallback

### endpoints built and verified
| endpoint | method | status | result |
|----------|--------|--------|--------|
| `/` | GET | ✅ | `{"message": "Welcome to Vibranium"}` |
| `/health` | GET | ✅ | `{"status": "vibranium is live"}` |
| `/namespaces` | POST | ✅ | creates real namespace in EKS |
| `/teams` | GET | ✅ | returns team list |
| `/services` | GET | ✅ | queries Argo Rollouts CRDs, returns `[]` (no rollouts yet — correct) |

### kubernetes — namespaces created in live cluster
```
team-payments     Active
team-auth         Active
team-infra        Active
```

### docker + ecr
- ECR repo recreated: `vibranium-test` (destroyed with terraform yesterday — noted for day 3)
- image built: `vibranium-backend:latest`
- pushed to: `974066991644.dkr.ecr.ap-south-1.amazonaws.com/vibranium-test:backend-latest`
- digest: `sha256:d805dcd1e51d1b47056057fc97f3bf25a3e235e1881716692f45a79192d0adbc`

### backend pod in EKS
- `backend-deployment.yaml` — Deployment + Service in `team-infra` namespace
- pod: `vibranium-backend-55ccdf758d-g4t5m` — `1/1 Running` in 7 seconds
- port-forward verified: `localhost:8001/health` → response from inside cluster

---

## bugs hit and fixed

| bug | cause | fix |
|-----|-------|-----|
| `uvicorn: command not found` | no venv, uvicorn not installed globally | `sudo apt install python3.14-venv` → venv → pip install |
| `Dockerfile cannot be empty` | Dockerfile was created but never written | added FROM, WORKDIR, COPY, RUN, CMD |
| `build context 130.5MB` | venv folder included in docker context | added `.dockerignore` with `venv/` |
| `ECR repo not found` | terraform destroy wiped the ECR repo | `aws ecr create-repository --repository-name vibranium-test` |
| `connection reset by peer` mid-push | flaky network to ap-south-1 | re-ran `docker push` — layers already uploaded, resumed cleanly |
| `docker build` from wrong directory | ran from `~/vibranium/` not `~/vibranium/backend/` | `cd ~/vibranium/backend` first |

---

## project structure (end of day 2)
```
vibranium/
├── frontend/
├── backend/
│   ├── __init__.py
│   ├── main.py              ← fastapi app, 5 endpoints
│   ├── k8s_client.py        ← kubernetes SDK wrapper
│   ├── requirements.txt     ← fastapi, uvicorn, kubernetes, pydantic, httpx
│   ├── Dockerfile           ← python:3.11-slim
│   ├── .dockerignore        ← excludes venv
│   └── backend-deployment.yaml  ← EKS deployment + service
├── helm/
│   └── vibranium-chart/
├── infra/
│   └── terraform/
├── docs/
├── .gitignore
└── README.md
```

---

## first thing tomorrow (day 3)

```bash
# 1. open WSL
cd ~/vibranium/infra/terraform

# 2. rebuild cluster (~15 min)
terraform apply
# type 'yes'

# 3. configure kubectl
aws eks update-kubeconfig --region ap-south-1 --name vibranium-cluster

# 4. verify nodes
kubectl get nodes

# 5. reinstall argo rollouts
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# 6. recreate ECR repo (gets wiped with terraform destroy)
aws ecr create-repository --repository-name vibranium-test --region ap-south-1

# 7. redeploy backend pod
kubectl create namespace team-infra
kubectl apply -f ~/vibranium/backend/backend-deployment.yaml

# 8. verify
kubectl get pods -n team-infra
kubectl get pods -n argo-rollouts

# 9. start day 3 — helm templates
cd ~/vibranium/helm/vibranium-chart/templates
```

---

## day 3 goals (manifest engine)

- helm templates for all 5 manifest types:
  - `namespace.yaml`
  - `deployment.yaml`
  - `service.yaml`
  - `rollout.yaml` ← argo rollouts canary config
  - `servicemonitor.yaml` ← prometheus scrape config
- `POST /services` endpoint — takes form input, renders helm templates, applies to EKS
- end-to-end: API call → namespace created → rollout running in cluster
- verify with `kubectl get rollouts -A`

---

## architecture decisions updated

| decision | choice | reason |
|----------|--------|--------|
| manifest engine | helm (not jinja2) | scales to 100 services — locked day 0 |
| deployment strategy | argo rollouts canary | shadow integration |
| region | ap-south-1 | cheapest for bangalore |
| node type | t3.small x2 | free tier eligible — no istio yet, revisit day 4 |
| backend runtime | EKS pod in team-infra | in-cluster config, production-accurate |
| ECR | recreate daily | destroyed with terraform — add to morning checklist |

---

## day-by-day plan

| day | codename | goal |
|-----|----------|------|
| **day 0** | **mise en place** | **done ✓** |
| **day 1** | **recon** | **done ✓ — cluster live, argo running** |
| **day 2** | **foundation** | **done ✓ — fastapi, k8s sdk, backend pod in EKS** |
| day 3 | manifest engine | helm templates, POST /services end-to-end |
| day 4 | shadow link | rollout trigger, polling, rollback endpoint |
| day 5 | harvey link | prometheus metrics, grafana + kiali links |
| day 6 | portal | react frontend — wizard, catalog, rollout view |
| day 7 | integration | e2e testing, chaos, screenshots, case study |
| day 8 | buffer | polish, docs, github readme, GIF |

---

## cost guardrails
- billing alert fires at $40
- hard cap: $50/month
- **nightly destroy protocol:** `terraform destroy` every night after done building
- **nightly apply protocol:** `terraform apply` every morning before building
- **ECR note:** repo gets destroyed with terraform — recreate each morning (1 command)

---

*wakanda forever. build the platform. let others build products.*
