# vibranium — day 1 handover
**date:** 6 june 2026  
**author:** aaroh seth (kaaaaash)  
**status:** day 1 complete — cluster live, argo rollouts running, destroyed for the night

---

## what got done today

### terraform apply — cluster provisioned
- `terraform apply` — 54 resources added, 0 errors
- cluster endpoint: `https://561C64C1574BF00D43244114BAD5D0C9.sk1.ap-south-1.eks.amazonaws.com`
- cluster name: `vibranium-cluster`
- region: `ap-south-1`
- kubectl configured via `aws eks update-kubeconfig`

### cluster state at EOD
| resource | status |
|----------|--------|
| node 1 (`ip-10-0-1-62`) | Ready — v1.31.14-eks-3385e9b |
| node 2 (`ip-10-0-2-138`) | Ready — v1.31.14-eks-3385e9b |
| argo-rollouts pod | 1/1 Running |
| coredns (x2) | 1/1 Running |
| aws-node (x2) | 2/2 Running |
| kube-proxy (x2) | 1/1 Running |
| CrashLoopBackOff anywhere | 0 |

### argo rollouts
- namespace `argo-rollouts` created
- all CRDs installed: `analysisruns`, `analysistemplates`, `clusteranalysistemplates`, `experiments`, `rollouts`
- controller pod: `argo-rollouts-54595797c6-pknrt` — Running

---

## bugs hit and fixed

| bug | cause | fix |
|-----|-------|-----|
| `InvalidParameterException: Requested AMI for version 1.29 not supported` | `variables.tf` defaulted to k8s `1.29`, AMI deprecated in ap-south-1 | changed `cluster_version` default to `1.31` in `variables.tf` |
| terraform hung at 25min on node group creation | Ctrl-C'd too early from prior failed apply, state had stale `1.29` cluster | `terraform destroy` → clean `terraform apply` |
| `AsgInstanceLaunchFailures: InvalidParameterCombination` | `t3.medium` not eligible on this AWS account's Free Tier restrictions | changed `node_instance_type` default to `t3.small` in `variables.tf` |

### variables.tf changes locked in
```hcl
# was "1.29" → now
default = "1.31"   # cluster_version

# was "t3.medium" → now
default = "t3.small"  # node_instance_type
```

> **note on t3.small:** shadow used t3.medium because istio needs ~2GB RAM. vibranium day 1-3 has no istio — t3.small is fine. revisit on day 4 when shadow integration begins.

---

## first thing tomorrow (day 2)

```bash
# 1. open WSL
cd ~/vibranium/infra/terraform

# 2. rebuild the cluster (~15 min)
terraform apply
# type 'yes' when prompted

# 3. configure kubectl
aws eks update-kubeconfig --region ap-south-1 --name vibranium-cluster

# 4. verify nodes
kubectl get nodes
# expect: 2 nodes, STATUS = Ready

# 5. reinstall argo rollouts (ephemeral cluster, clean state each day)
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# 6. verify
kubectl get pods -A

# 7. start day 2 — fastapi scaffold
cd ~/vibranium/backend
```

---

## day 2 goals (foundation)

- fastapi app scaffold — `main.py`, `requirements.txt`, `Dockerfile`
- kubernetes python SDK wired up — in-cluster config
- `GET /health` endpoint working
- `POST /namespaces` — creates a namespace in EKS
- `GET /services` — lists rollouts across all namespaces
- backend running as a pod inside the cluster

---

## architecture decisions updated

| decision | choice | reason |
|----------|--------|--------|
| manifest engine | helm (not jinja2) | scales to 100 services |
| deployment strategy | argo rollouts canary | shadow integration, progressive delivery |
| region | ap-south-1 | cheapest for bangalore |
| node type | **t3.small x2** (was t3.medium) | free tier eligible — no istio yet, revisit day 4 |
| frontend | react 18 + tailwind | matches PRD spec |
| backend | fastapi + python | matches PRD spec, same stack as shadow |

---

## day-by-day plan

| day | codename | goal |
|-----|----------|------|
| **day 0** | **mise en place** | **done ✓** |
| **day 1** | **recon** | **done ✓ — cluster live, argo running** |
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
