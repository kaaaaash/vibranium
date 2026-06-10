from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

from k8s_client import (
    get_k8s_clients,
    create_namespace,
    create_service,
    create_deployment,
    create_rollout,
    get_rollout_status,
    list_all_rollouts,
    rollback_rollout,
)

app = FastAPI(title="Vibranium API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

class ServiceCreateRequest(BaseModel):
    name: str
    team: str
    image: str
    port: int = 8000
    replicas: int = 2


class DeployRequest(BaseModel):
    image: str


# ---------- Health ----------

@app.get("/")
def root():
    return {"message": "Welcome to Vibranium"}


@app.get("/health")
def health():
    return {"status": "vibranium is live", "version": "0.4.0"}


# ---------- Teams ----------

TEAMS = [
    {"name": "team-payments", "display": "Payments"},
    {"name": "team-auth",     "display": "Auth"},
    {"name": "team-gateway",  "display": "Gateway"},
    {"name": "team-infra",    "display": "Infra"},
]

@app.get("/teams")
def list_teams():
    return {"teams": TEAMS}


# ---------- Namespaces ----------

@app.post("/namespaces")
def create_ns(body: dict):
    name = body.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="name is required")
    result = create_namespace(name)
    return {"status": "created", "namespace": name, "detail": result}


# ---------- Service catalog ----------

@app.get("/services")
def list_services():
    """List all Argo Rollouts across every namespace."""
    return {"services": list_all_rollouts()}


@app.get("/services/{name}")
def get_service(name: str, namespace: str = "default"):
    status = get_rollout_status(name, namespace)
    if not status:
        raise HTTPException(status_code=404, detail=f"Rollout '{name}' not found in namespace '{namespace}'")
    return status


# ---------- Create + deploy ----------

@app.post("/services")
def create_service_endpoint(req: ServiceCreateRequest):
    """
    Option B+: build every K8s resource directly via the Python SDK.
    No Helm binary. No subprocess. No YAML files on disk.
    """
    namespace = req.team if req.team.startswith("team-") else f"team-{req.team}"

    # 1. Namespace
    create_namespace(namespace)

    # 2. ClusterIP Service
    create_service(name=req.name, namespace=namespace, port=req.port)

    # 3. Deployment (stable baseline — Argo Rollout manages replicas)
    create_deployment(
        name=req.name,
        namespace=namespace,
        image=req.image,
        port=req.port,
        replicas=req.replicas,
    )

    # 4. Argo Rollout (canary strategy, shadows the Deployment)
    create_rollout(
        name=req.name,
        namespace=namespace,
        image=req.image,
        port=req.port,
        replicas=req.replicas,
    )

    return {
        "status": "deployed",
        "service": req.name,
        "team": namespace,
        "resources": ["Namespace", "Service", "Deployment", "Rollout"],
    }


# ---------- Trigger new deploy (image update) ----------

@app.post("/services/{name}/deploy")
def deploy_new_image(name: str, req: DeployRequest, namespace: str = "default"):
    """Update the Rollout image to trigger a new canary rollout."""
    from kubernetes import client as k8s_client, config as k8s_config
    try:
        try:
            k8s_config.load_incluster_config()
        except Exception:
            k8s_config.load_kube_config()

        custom = k8s_client.CustomObjectsApi()
        patch = {
            "spec": {
                "template": {
                    "spec": {
                        "containers": [{"name": name, "image": req.image}]
                    }
                }
            }
        }
        custom.patch_namespaced_custom_object(
            group="argoproj.io",
            version="v1alpha1",
            namespace=namespace,
            plural="rollouts",
            name=name,
            body=patch,
        )
        return {"status": "rollout triggered", "service": name, "image": req.image}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Rollout status (polling endpoint) ----------

@app.get("/services/{name}/rollout")
def rollout_status(name: str, namespace: str = "default"):
    status = get_rollout_status(name, namespace)
    if not status:
        raise HTTPException(status_code=404, detail=f"Rollout '{name}' not found")
    return status


# ---------- Rollback ----------

@app.post("/services/{name}/rollback")
def rollback(name: str, namespace: str = "default"):
    result = rollback_rollout(name, namespace)
    return {"status": "rollback initiated", "service": name, "detail": result}


@app.get("/services/{name}/metrics")
def service_metrics(name: str, namespace: str = "team-payments"):
    from k8s_client import get_service_metrics
    return get_service_metrics(name, namespace)

@app.get("/services/{name}/monitor")
def service_monitor(name: str, namespace: str = "team-payments"):
    from k8s_client import get_harvey_links, get_rollout_status
    links = get_harvey_links(name, namespace)
    status = get_rollout_status(name, namespace)
    return {
        "service": name,
        "namespace": namespace,
        "rollout_phase": status["phase"] if status else "Unknown",
        "monitoring": links,
    }