# vibranium — day 0 handover
**date:** 5 june 2026  
**author:** aaroh seth (kaaaaash)  
**status:** day 0 complete — ready to apply tomorrow

---

## what got done today

### tools (all verified inside WSL2)
| tool | version | status |
|------|---------|--------|
| aws cli | 2.34.45 | ready |
| kubectl | 1.36.0 | ready |
| terraform | 1.15.5 | ready (updated from 1.8.5) |
| helm | 3.20.2 | ready |
| eksctl | 0.226.0 | ready |
| python | 3.14.4 | ready |
| node | 20.20.2 | ready (fresh install via nvm) |
| docker | 29.1.3 | ready |

### aws
- connected as root user (account: 974066991644)
- region set to `ap-south-1` (Mumbai)
- billing alert set at $40 (80% of $50 cap)
- ecr repo created: `vibranium-test`

### github
- repo live at: https://github.com/kaaaaash/vibranium
- branch: `main`
- first commit pushed: `6315942`

### project structure
```
vibranium/
├── frontend/           # react app (day 6)
├── backend/            # fastapi (day 2)
│   └── __init__.py
├── helm/
│   └── vibranium-chart/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/  # helm templates go here (replaces jinja2)
├── infra/
│   └── terraform/
│       ├── main.tf     # providers
│       ├── variables.tf
│       ├── vpc.tf      # 2 AZs, public + private subnets, NAT gateway
│       ├── eks.tf      # EKS cluster, t3.medium x2 nodes
│       └── outputs.tf
├── docs/
├── .gitignore
└── README.md
```

### terraform
- `terraform init` — complete, all providers downloaded
- `terraform plan` — 54 resources to add, 0 errors
- **not applied yet** — apply tomorrow morning

---

## first thing tomorrow (day 1)

```bash
# 1. open WSL
cd ~/vibranium/infra/terraform

# 2. apply the cluster (~15 mins, costs money from this point)
terraform apply
# type 'yes' when prompted

# 3. once done, configure kubectl
aws eks update-kubeconfig --region ap-south-1 --name vibranium-cluster

# 4. verify cluster is alive
kubectl get nodes

# 5. install argo rollouts (Shadow dependency)
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# 6. verify argo rollouts
kubectl get pods -n argo-rollouts
```

---

## architecture decisions locked in

| decision | choice | reason |
|----------|--------|--------|
| manifest engine | helm (not jinja2) | scales to 100 services, answers the interviewer question |
| deployment strategy | argo rollouts canary | shadow integration, progressive delivery |
| region | ap-south-1 | cheapest for bangalore, reduces latency |
| node type | t3.medium x2 | enough for dev, nightly destroy keeps costs under $50 |
| frontend | react 18 + tailwind | matches PRD spec |
| backend | fastapi + python | matches PRD spec, same stack as shadow |

---

## shuri's roast — fixes baked in

| problem | fix |
|---------|-----|
| jinja2 doesn't scale | helm charts from day 1 |
| no auth story | prepared answer: "cut for build-time, production would use SSO group → namespace mapping" |
| weak service catalog | will add version, last deploy time, last deployed by |
| no architecture diagram | goes in README on day 7 |

---

## day-by-day plan

| day | codename | goal |
|-----|----------|------|
| **day 0** | **mise en place** | **done ✓** |
| day 1 | recon | terraform apply, argo rollouts, verify shadow + harvey |
| day 2 | foundation | fastapi scaffold, kubernetes sdk, namespace api |
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

---

*wakanda forever. build the platform. let others build products.*
