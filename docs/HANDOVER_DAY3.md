# vibranium — day 3 handover

**date:** 8 june 2026
**author:** aaroh seth (kaaaaash)
**status:** day 3 complete — first end-to-end service deployment successful, destroyed for the night
**build time:** ~3 hours (including debugging)

---

## what got done today

### helm manifest engine

* helm chart integrated into backend container
* backend can render manifests dynamically using service input
* chart includes:

  * `namespace.yaml`
  * `deployment.yaml`
  * `service.yaml`
  * `rollout.yaml`
  * `servicemonitor.yaml`

### POST /services endpoint

* endpoint accepts service metadata
* renders helm templates
* applies generated manifests directly to EKS
* returns deployment status and applied resources

### first successful service deployment

request:

```json
{
  "name": "payment-service",
  "team": "team-payments",
  "image": "nginx:latest",
  "port": 8000,
  "replicas": 2
}
```

response:

```json
{
  "status": "deployed",
  "service": "payment-service",
  "team": "team-payments"
}
```

generated and applied:

* Namespace/team-payments
* ConfigMap/payment-service-monitor-config
* Service/payment-service
* Deployment/payment-service
* Rollout/payment-service

### helm inside EKS backend pod

verified:

```bash
helm version
```

result:

```text
v3.21.0
```

### rollout verification

verified:

```bash
kubectl get rollout -n team-payments
```

result:

```text
AVAILABLE = 2
```

---

## kubernetes resources created

namespace:

```text
team-payments
```

pods:

```text
payment-service-66dcb69687-4ktgg
payment-service-66dcb69687-kj228
```

service:

```text
payment-service
```

argo rollout:

```text
payment-service
```

all resources healthy and running.

---

## bugs hit and fixed

| bug                                        | cause                                           | fix                                                       |
| ------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------- |
| `helm: not found`                          | helm CLI missing from backend image             | installed helm in Dockerfile                              |
| backend still missing helm after rebuild   | deployment using old image tag                  | pushed new image and updated deployment                   |
| `curl: empty reply from server`            | port-forward process died                       | restarted port-forward                                    |
| `path /app/helm/vibranium-chart not found` | helm chart not copied into image                | copied chart into backend build context                   |
| `403 forbidden creating namespaces`        | backend service account lacked RBAC permissions | created cluster-admin binding for dev environment         |
| deployment image update failed             | wrong container name used in kubectl set image  | verified container name (`backend`) and updated correctly |

---

## project structure (end of day 3)

```text
vibranium/
├── frontend/
├── backend/
│   ├── main.py
│   ├── k8s_client.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── backend-deployment.yaml
│   └── helm/
│       └── vibranium-chart/
├── helm/
│   └── vibranium-chart/
├── infra/
│   └── terraform/
├── docs/
├── .gitignore
└── README.md
```

---

## first thing tomorrow (day 4)

```bash
cd ~/vibranium/infra/terraform

terraform apply

aws eks update-kubeconfig \
  --region ap-south-1 \
  --name vibranium-cluster

kubectl get nodes

kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts \
  -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

aws ecr create-repository \
  --repository-name vibranium-test \
  --region ap-south-1

kubectl create namespace team-infra
kubectl apply -f ~/vibranium/backend/backend-deployment.yaml
```

---

## day 4 goals

* service catalog endpoint
* list deployed applications
* rollout status endpoint
* rollout visibility APIs
* deployment details API
* prepare backend for frontend integration

---

## architecture decisions updated

| decision            | choice                   | reason                                   |
| ------------------- | ------------------------ | ---------------------------------------- |
| manifest engine     | helm                     | validated successfully end-to-end        |
| deployment strategy | argo rollouts            | first rollout successfully deployed      |
| backend permissions | cluster-admin (dev only) | unblock platform development             |
| deployment workflow | API → Helm → EKS         | validated successfully                   |
| service creation    | fully automated          | no manual kubectl required for workloads |

---

## day-by-day plan

| day   | codename        | goal                           |
| ----- | --------------- | ------------------------------ |
| day 0 | mise en place   | done ✓                         |
| day 1 | recon           | done ✓                         |
| day 2 | foundation      | done ✓                         |
| day 3 | manifest engine | done ✓                         |
| day 4 | shadow link     | rollout visibility and control |
| day 5 | harvey link     | observability integration      |
| day 6 | portal          | react frontend                 |
| day 7 | integration     | e2e testing                    |
| day 8 | buffer          | polish and case study          |

---

## cost guardrails

* billing alert at $40
* hard cap: $50/month
* nightly destroy protocol remains mandatory
* terraform destroy after each work session
* terraform apply before each build session
* ECR repository recreated each morning

---

## day 3 milestone

first successful end-to-end deployment through vibranium.

developer request → fastapi → helm → kubernetes → argo rollout → running application.

vibranium successfully deployed its first workload without manual kubectl deployment steps.

---

*wakanda forever. the platform deployed its first app today.*
