from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from k8s_client import K8sClient
import subprocess
import tempfile
import yaml
import os

app = FastAPI(title="Vibranium API")
k8s = K8sClient()

HELM_CHART_PATH = os.environ.get("HELM_CHART_PATH", "/app/helm/vibranium-chart")

# ── models ────────────────────────────────────────────────────────────────────

class ServiceCreateRequest(BaseModel):
    name: str
    team: str
    image: str
    port: int = 8000
    replicas: int = 2

class NamespaceCreateRequest(BaseModel):
    name: str

# ── helpers ───────────────────────────────────────────────────────────────────

def render_helm_templates(req: ServiceCreateRequest) -> list[dict]:
    """Run helm template and return list of parsed manifest dicts."""
    cmd = [
        "helm", "template", req.name, HELM_CHART_PATH,
        "--set", f"name={req.name}",
        "--set", f"team={req.team}",
        "--set", f"image={req.image}",
        "--set", f"port={req.port}",
        "--set", f"replicas={req.replicas}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Helm render failed: {result.stderr}")

    manifests = []
    for doc in yaml.safe_load_all(result.stdout):
        if doc is not None:
            manifests.append(doc)
    return manifests

def apply_manifest(manifest: dict):
    """Apply a single manifest dict to EKS via dynamic client."""
    api_version = manifest.get("apiVersion", "")
    kind = manifest.get("kind", "")
    name = manifest["metadata"]["name"]
    namespace = manifest["metadata"].get("namespace")

    try:
        if kind == "Namespace":
            k8s.create_namespace(name)

        elif kind == "Deployment":
            k8s.apply_deployment(manifest)

        elif kind == "Service":
            k8s.apply_service(manifest)

        elif kind == "Rollout" or (api_version.startswith("argoproj.io") and kind == "Rollout"):
            k8s.apply_rollout(manifest)

        elif kind == "ConfigMap":
            k8s.apply_configmap(manifest)

    except Exception as e:
        # namespace already exists = fine, everything else raise
        if "already exists" in str(e):
            pass
        else:
            raise HTTPException(status_code=500, detail=f"Failed to apply {kind}/{name}: {str(e)}")

# ── endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Welcome to Vibranium"}

@app.get("/health")
def health():
    return {"status": "vibranium is live"}

@app.get("/teams")
def get_teams():
    return {
        "teams": [
            {"name": "payments", "namespace": "team-payments"},
            {"name": "auth",     "namespace": "team-auth"},
            {"name": "gateway",  "namespace": "team-gateway"},
            {"name": "infra",    "namespace": "team-infra"},
        ]
    }

@app.post("/namespaces")
def create_namespace(req: NamespaceCreateRequest):
    result = k8s.create_namespace(req.name)
    return {"status": "created", "namespace": req.name}

@app.get("/services")
def list_services():
    rollouts = k8s.list_rollouts()
    return {"services": rollouts}

@app.post("/services")
def create_service(req: ServiceCreateRequest):
    manifests = render_helm_templates(req)
    applied = []
    for manifest in manifests:
        apply_manifest(manifest)
        applied.append(f"{manifest['kind']}/{manifest['metadata']['name']}")
    return {
        "status": "deployed",
        "service": req.name,
        "team": req.team,
        "applied": applied
    }
