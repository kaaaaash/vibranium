# ⚫ VIBRANIUM

> *"Just because something works doesn't mean it cannot be improved."* — Aaroh seth(kaash) 
> This isn't a course project. This is a **control plane that fights back.**

> **DEPLOY. OBSERVE. RECOVER.**

---

## THE DECREE

An **Internal Developer Platform** for Kubernetes — the kind a platform team hands to product engineers so they can ship without touching `kubectl`. Built solo, from the cluster up.

A developer clicks **Deploy**. Vibranium runs a progressive canary, watches it, and if the rollout goes rogue — **one button drags it back to safety.** Every action is authenticated, authorized server-side, and written to an immutable audit trail.

When a bad image hits the cluster, traffic never reaches it.  
When someone tries an action above their role, the platform says no — and *logs that they tried.*  
That's not a dashboard. That's a control plane.

---

## THE ARSENAL

![React](https://img.shields.io/badge/react-%2320232a.svg?style=plastic&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=plastic&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=plastic&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=plastic&logo=python&logoColor=ffdd54)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=plastic&logo=amazon-aws&logoColor=white)
![EKS](https://img.shields.io/badge/Amazon%20EKS-FF9900?style=plastic&logo=amazoneks&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-%235835CC.svg?style=plastic&logo=terraform&logoColor=white)
![Argo](https://img.shields.io/badge/Argo%20Rollouts-EF7B4D?style=plastic&logo=argo&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=plastic&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=plastic&logo=docker&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google%20SSO-4285F4?style=plastic&logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=plastic&logo=jsonwebtokens)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=plastic&logo=sqlite&logoColor=white)

---

## PATH OF THE REQUEST

```
Developer opens the platform
      ↓
React + Vite UI  →  "Continue with Google"
      ↓
Google SSO (domain-restricted)  →  JWT minted (HS256, 8h)
      ↓
FastAPI control plane receives the call
      ↓
RBAC GUARD  →  role × permission checked SERVER-SIDE
      ├── not allowed?  →  403 + written to audit log as "denied"
      └── allowed?      →  proceed
              ↓
k8s_client talks to the EKS cluster (vibranium-cluster, ap-south-1)
      ↓
Argo Rollouts runs the canary  →  20% → 40% → 60% → 80% → 100%
      ├── healthy?   →  promote to stable
      └── degraded?  →  one click ROLLBACK → previous revision restored
              ↓
Every deploy, rollback & denial  →  immutable audit trail (SQLite)
```

---

## THE LOGIN GATE

Authenticate with your company account to enter the control plane. SSO via Google, RBAC enforced server-side — no token, no entry.

![Login](screenshots/01-login.png)
*The gate. Domain-restricted Google SSO — a JWT is minted only after the backend approves you.*

![Dashboard](screenshots/02-homescreen.png)
*Inside the control plane.*

![Dashboard detail](screenshots/03-dashboard.png)
*Fleet at a glance — services, health, recent activity.*

---

## THE VAULT — SERVICE CATALOG

Every service registered to the platform, one click from a deploy.

![Catalog](screenshots/04-catalog.png)
*The catalog. `checkout-demo` ready for orders.*

![Deploy](screenshots/05-deploy.png)
*The deploy wizard — pick an image, fire a progressive rollout. No YAML, no `kubectl`.*

---

## PROGRESSIVE DELIVERY — THE CANARY

A new version doesn't get the throne. It earns it — 20% of traffic at a time.

![Canary](screenshots/06-canary.png)
*Canary mid-advance. Argo Rollouts shifting traffic step by step.*

![Healthy](screenshots/07-deployed.png)
*Promoted. Healthy. 100% stable.*

---

## TRIAL BY COMBAT

You don't trust a platform because it deploys. You trust it because of what happens **when you break it.**

![Bad deploy](screenshots/08-failed-deploy.png)
*A poisoned image (`:9.9.9`) gets shipped on purpose.*

![Degraded](screenshots/09-degraded.png)
*The rollout goes **Degraded** — and traffic stays pinned at 0%. Users never see the broken version.*

![Degraded terminal](screenshots/10-degraded-terminal.png)
*Ground truth from the cluster — `ImagePullBackOff`, exactly as the UI reported.*

![Rollback](screenshots/11-rollback.png)
*One button. The kill order.*

![Recovered](screenshots/12-recovered.png)
*Back to Healthy. Crisis over. Zero `kubectl`. Zero downtime.*

---

## NO TOKEN, NO TRESPASS — RBAC & AUDIT

Permissions are checked **server-side**, every single time. Four roles, five permissions, one source of truth.

| Role | view | deploy | monitor | rollback | manage_users |
| --- | :---: | :---: | :---: | :---: | :---: |
| **viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **developer** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **sre** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **platform-admin** | ✅ | ✅ | ✅ | ✅ | ✅ |

![Audit trail](screenshots/13-audit-trail.png)
*The receipts. Every deploy, rollback — and every **denied** attempt — is written down. You can't do it and pretend you didn't.*

![Profile](screenshots/14-profile.png)
*Identity & assigned role.*

![My activity](screenshots/20-my-activity-feed.png)
*Your personal trail through the control plane.*

---

## PROOF IT'S REAL

Not a mockup. Real EKS, real rollouts, real infra.

| | |
| --- | --- |
| ![Argo](screenshots/15-argo-rollouts.png) | ![Terraform](screenshots/16-terraform-nodes.png) |
| ![Backend live](screenshots/17-backend-live.png) | ![Backend running](screenshots/18-backend-running.png) |
| ![Frontend running](screenshots/19-frontend-running.png) | |

---

## RAISE THE PLATFORM YOURSELF

```bash
# Clone the vault
git clone https://github.com/kaaaaash/vibranium.git
cd vibranium

# 1) Forge the cluster (EKS, ~15-20 min)
cd infra/terraform
terraform init
terraform apply                      # type "yes"
aws eks update-kubeconfig --name vibranium-cluster --region ap-south-1
kubectl get nodes                    # nodes should be Ready

# Install Argo Rollouts
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f \
  https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# 2) Wake the control plane (FastAPI)
cd ../../backend
source .venv/bin/activate
pip install -r requirements.txt
export VIB_JWT_SECRET="$(openssl rand -hex 32)"
export GOOGLE_CLIENT_ID="<your-gcp-oauth-client-id>.apps.googleusercontent.com"
export VIB_DB_PATH="./vib.db"
export ALLOWED_DOMAINS="gmail.com"
uvicorn main:app --reload --host 0.0.0.0 --port 8001
# health → {"status":"vibranium is live","version":"0.5.0"}

# 3) Light the interface (React + Vite)
cd ../frontend
npm install
cat > .env <<EOF
VITE_API=http://localhost:8001
VITE_GOOGLE_CLIENT_ID=<your-gcp-oauth-client-id>.apps.googleusercontent.com
EOF
npm run dev                          # → http://localhost:5173
```

> ⚠️ Add `http://localhost:5173` to your Google OAuth client's **Authorized JavaScript origins**, and make sure your login email's domain is in `ALLOWED_DOMAINS`.

---

## THE BLUEPRINT

```
vibranium/
├── backend/                 ← FastAPI control plane (v0.5.0)
│   ├── main.py              ← API surface
│   ├── auth.py              ← Google SSO + JWT (HS256, 8h)
│   ├── k8s_client.py        ← deploy / rollback against EKS
│   ├── db.py                ← SQLite audit log
│   ├── rbac.yaml            ← roles × permissions matrix
│   └── helm/vibranium-chart ← in-cluster deploy
├── frontend/                ← React + Vite UI
│   └── src/                 ← pages, components, AuthContext
├── infra/terraform/         ← EKS, VPC, IAM (ap-south-1)
└── docs/                    ← 7-day handover logs
```

---

## OPERATION TIMELINE

| Day | Objective | Status |
| --- | --- | --- |
| 1 | Terraform → EKS cluster online | ✅ |
| 2 | FastAPI control plane + ECR push | ✅ |
| 3 | Google SSO + JWT auth | ✅ |
| 4 | Argo Rollouts canary integration | ✅ |
| 5 | React UI — catalog, deploy, rollout views | ✅ |
| 6 | RBAC + immutable audit trail | ✅ |
| 7 | Chaos testing + documentation | ✅ |

**Built solo · 7 days · 1 control plane that doesn't flinch.**

---

## OPERATOR NOTES

This was built alone. No team, no senior dev reviewing PRs — just handover docs, broken rollouts, and a lot of `terraform destroy`.

An IDP isn't hard because the code is complex. It's hard because it has to be *trustworthy* — a junior dev has to be able to click "Deploy" at 2am and know that if it goes wrong, the platform catches it, not them. That's the whole point: **make the safe thing the easy thing.**

Six months ago "canary deployment" was a phrase on a slide. Now I've got one shifting real traffic on real EKS, with a rollback button that actually works when you break it.

---

## WAKANDA GOES DARK

```bash
cd infra/terraform
terraform destroy        # zero the burn rate
```

> 🗝️ Grab your audit-trail screenshots *before* this — the log lives in SQLite and goes with the cluster.

---

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   VIBRANIUM: ONLINE                                           ║
║   "It is the strongest metal on Earth." — so is good infra.   ║
║                                                               ║
║   Deploy. Observe. Recover.                                   ║
║   Operator: kaash                                             ║
║   Status: WAKANDA FOREVER 🐾                                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=plastic&logo=github&logoColor=white)](https://github.com/kaaaaash)
[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=plastic&logo=linkedin&logoColor=white)](https://linkedin.com/in/aarohseth)
[![X](https://img.shields.io/badge/X-black.svg?style=plastic&logo=X&logoColor=white)](https://x.com/AarohSeth)

*The vault is sealed. The metal is online.*
