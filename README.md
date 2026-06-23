<div align="center">

# ⚫ VIBRANIUM

### Internal Developer Platform for Kubernetes

> *"Just because something works doesn't mean it cannot be improved."*
>
> — Aaroh Seth (Kaash)

### DEPLOY · OBSERVE · RECOVER

![AWS](https://img.shields.io/badge/AWS-EKS-orange?style=for-the-badge&logo=amazonaws)
![Argo](https://img.shields.io/badge/Argo-Rollouts-red?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-Control_Plane-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react)

</div>

---

## THE DECREE

This isn't a course project.

This isn't another Kubernetes dashboard.

This is a **control plane that fights back.**

An **Internal Developer Platform** for Kubernetes — the kind a platform team hands to product engineers so they can ship without touching `kubectl`.

Built solo.

From the cluster up.

A developer clicks **Deploy**.

Vibranium launches a progressive canary.

If the rollout goes rogue, **one button drags it back to safety.**

Every action is authenticated.

Every permission is enforced server-side.

Every deployment, rollback and denial is written to an immutable audit trail.

When a bad image hits the cluster, traffic never reaches it.

When someone tries an action above their role, the platform says no — and *logs that they tried.*

That's not a dashboard.

That's a control plane.

> **Region:** ap-south-1
>
> **Cluster:** vibranium-cluster
>
> **Sprint:** 7 Days
>
> **Built By:** One Engineer

---

## WHAT VIBRANIUM DOES

✅ Google SSO Authentication

✅ JWT Session Management

✅ Kubernetes Service Catalog

✅ Progressive Canary Deployments

✅ One-Click Rollbacks

✅ Amazon EKS Integration

✅ Argo Rollouts Traffic Shifting

✅ Server-Side RBAC Enforcement

✅ Immutable Audit Trail

✅ Infrastructure as Code (Terraform)

---

## THE ARSENAL ⚔️

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

```text
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

Authenticate with your company account to enter the control plane.

SSO via Google.

RBAC enforced server-side.

No token. No entry.

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

*The deploy wizard — pick an image, fire a progressive rollout. No YAML. No `kubectl`.*

---

## PROGRESSIVE DELIVERY — THE CANARY

A new version doesn't get the throne.

It earns it.

20% of traffic at a time.

![Canary](screenshots/06-canary.png)

*Canary mid-advance. Argo Rollouts shifting traffic step by step.*

![Healthy](screenshots/07-deployed.png)

*Promoted. Healthy. 100% stable.*

---

## TRIAL BY COMBAT

You don't trust a platform because it deploys.

You trust it because of what happens when you break it.

![Bad deploy](screenshots/08-failed-deploy.png)

*A poisoned image (`:9.9.9`) gets shipped on purpose.*

![Degraded](screenshots/09-degraded.png)

*The rollout goes Degraded — traffic stays pinned at 0%. Users never see the broken version.*

![Degraded terminal](screenshots/10-degraded-terminal.png)

*Ground truth from the cluster — `ImagePullBackOff`, exactly as the UI reported.*

![Rollback](screenshots/11-rollback.png)

*One button. The kill order.*

![Recovered](screenshots/12-recovered.png)

*Back to Healthy. Crisis over. Zero kubectl. Zero downtime.*

---

## NO TOKEN, NO TRESPASS — RBAC & AUDIT

Permissions are checked server-side.

Every single time.

Four roles.

Five permissions.

One source of truth.

| Role | View | Deploy | Monitor | Rollback | Manage Users |
|--------|--------|--------|--------|--------|--------|
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Developer | ✅ | ✅ | ✅ | ❌ | ❌ |
| SRE | ✅ | ✅ | ✅ | ✅ | ❌ |
| Platform Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

![Audit trail](screenshots/13-audit-trail.png)

*The receipts. Every deploy, rollback and denied attempt is written down forever.*

![Profile](screenshots/14-profile.png)

*Identity & assigned role.*

![My activity](screenshots/20-my-activity-feed.png)

*Your personal trail through the control plane.*

---

## PROOF IT'S REAL 🔥

Not a mockup.

Not local Docker screenshots.

Not Figma.

Real EKS.

Real rollouts.

Real infrastructure.

Real failure recovery.
