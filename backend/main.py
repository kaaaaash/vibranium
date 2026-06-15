from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import (
    get_current_user,
    require_permission,
    router as auth_router,
)

from k8s_client import (
    create_deployment,
    create_namespace,
    create_rollout,
    create_service,
    get_rollout_status,
    list_all_rollouts,
    rollback_rollout,
)

app = FastAPI(
    title="Vibranium API",
    version="0.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


# ============================================================
# RBAC HELPERS
# ============================================================

def resolve_namespace(
    user: dict,
    namespace: Optional[str] = None,
) -> str:
    """
    Admins can inspect any namespace.
    Everyone else is restricted to their own namespace.
    """

    if user.get("is_admin"):
        return namespace or user["namespace"]

    user_namespace = user["namespace"]

    if namespace and namespace != user_namespace:
        raise HTTPException(
            status_code=403,
            detail="Cross-team access denied",
        )

    return user_namespace


# ============================================================
# MODELS
# ============================================================

class ServiceCreateRequest(BaseModel):
    name: str
    team: str
    image: str
    port: int = 8000
    replicas: int = 2


class DeployRequest(BaseModel):
    image: str


# ============================================================
# HEALTH
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to Vibranium"
    }


@app.get("/health")
def health():
    return {
        "status": "vibranium is live",
        "version": "0.5.0",
    }


# ============================================================
# TEAMS
# ============================================================

TEAMS = [
    {
        "name": "team-payments",
        "display": "Payments",
    },
    {
        "name": "team-auth",
        "display": "Auth",
    },
    {
        "name": "team-gateway",
        "display": "Gateway",
    },
    {
        "name": "team-infra",
        "display": "Infra",
    },
]


@app.get("/teams")
def list_teams(
    user=Depends(get_current_user),
):
    return {
        "teams": TEAMS
    }


# ============================================================
# NAMESPACES
# ============================================================

@app.post("/namespaces")
def create_ns(
    body: dict,
    user=Depends(require_permission("deploy")),
):
    name = body.get("name")

    if not name:
        raise HTTPException(
            status_code=400,
            detail="name is required",
        )

    namespace = resolve_namespace(user, name)

    result = create_namespace(namespace)

    return {
        "status": "created",
        "namespace": namespace,
        "detail": result,
    }


# ============================================================
# SERVICES
# ============================================================

@app.get("/services")
def list_services(
    user=Depends(require_permission("view")),
):
    services = list_all_rollouts()

    if not user.get("is_admin"):
        namespace = user.get("namespace")

        services = [
            svc
            for svc in services
            if svc.get("namespace") == namespace
        ]

    return {
        "services": services
    }


@app.get("/services/{name}")
def get_service(
    name: str,
    namespace: Optional[str] = None,
    user=Depends(require_permission("view")),
):
    namespace = resolve_namespace(
        user,
        namespace,
    )

    status = get_rollout_status(
        name,
        namespace,
    )

    if not status:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Rollout '{name}' "
                f"not found in namespace '{namespace}'"
            ),
        )

    return status


# ============================================================
# CREATE SERVICE
# ============================================================

@app.post("/services")
def create_service_endpoint(
    req: ServiceCreateRequest,
    user=Depends(require_permission("deploy")),
):
    requested_namespace = (
        req.team
        if req.team.startswith("team-")
        else f"team-{req.team}"
    )

    namespace = resolve_namespace(
        user,
        requested_namespace,
    )

    create_namespace(namespace)

    create_service(
        name=req.name,
        namespace=namespace,
        port=req.port,
    )

    create_deployment(
        name=req.name,
        namespace=namespace,
        image=req.image,
        port=req.port,
        replicas=req.replicas,
    )

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
        "resources": [
            "Namespace",
            "Service",
            "Deployment",
            "Rollout",
        ],
    }


# ============================================================
# DEPLOY NEW IMAGE
# ============================================================

@app.post("/services/{name}/deploy")
def deploy_new_image(
    name: str,
    req: DeployRequest,
    namespace: Optional[str] = None,
    user=Depends(require_permission("deploy")),
):
    namespace = resolve_namespace(
        user,
        namespace,
    )

    from kubernetes import client as k8s_client
    from kubernetes import config as k8s_config

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
                        "containers": [
                            {
                                "name": name,
                                "image": req.image,
                            }
                        ]
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

        return {
            "status": "rollout triggered",
            "service": name,
            "image": req.image,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ============================================================
# ROLLOUT STATUS
# ============================================================

@app.get("/services/{name}/rollout")
def rollout_status_endpoint(
    name: str,
    namespace: Optional[str] = None,
    user=Depends(require_permission("view")),
):
    namespace = resolve_namespace(
        user,
        namespace,
    )

    status = get_rollout_status(
        name,
        namespace,
    )

    if not status:
        raise HTTPException(
            status_code=404,
            detail=f"Rollout '{name}' not found",
        )

    return status


# ============================================================
# ROLLBACK
# ============================================================

@app.post("/services/{name}/rollback")
def rollback_endpoint(
    name: str,
    namespace: Optional[str] = None,
    user=Depends(require_permission("rollback")),
):
    namespace = resolve_namespace(
        user,
        namespace,
    )

    result = rollback_rollout(
        name,
        namespace,
    )

    return {
        "status": "rollback initiated",
        "service": name,
        "detail": result,
    }


# ============================================================
# METRICS
# ============================================================

@app.get("/services/{name}/metrics")
def service_metrics(
    name: str,
    namespace: Optional[str] = None,
    user=Depends(require_permission("view")),
):
    namespace = resolve_namespace(
        user,
        namespace,
    )

    from k8s_client import get_service_metrics

    return get_service_metrics(
        name,
        namespace,
    )


# ============================================================
# MONITORING
# ============================================================

@app.get("/services/{name}/monitor")
def service_monitor(
    name: str,
    namespace: Optional[str] = None,
    user=Depends(require_permission("monitor")),
):
    namespace = resolve_namespace(
        user,
        namespace,
    )

    from k8s_client import (
        get_harvey_links,
        get_rollout_status,
    )

    links = get_harvey_links(
        name,
        namespace,
    )

    status = get_rollout_status(
        name,
        namespace,
    )

    return {
        "service": name,
        "namespace": namespace,
        "rollout_phase": (
            status["phase"]
            if status
            else "Unknown"
        ),
        "monitoring": links,
    }