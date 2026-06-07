from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from kubernetes.client import CustomObjectsApi
from k8s_client import get_k8s_client
from kubernetes import client as k8s_client_lib

app = FastAPI(title="Vibranium API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Welcome to Vibranium"}


@app.get("/health")
def health():
    return {"status": "vibranium is live"}


@app.get("/teams")
def list_teams():
    return {
        "teams": [
            "payments",
            "auth",
            "gateway",
            "infra"
        ]
    }


@app.post("/namespaces")
def create_namespace(team: str):
    v1, _ = get_k8s_client()

    ns = k8s_client_lib.V1Namespace(
        metadata=k8s_client_lib.V1ObjectMeta(
            name=f"team-{team}",
            labels={
                "managed-by": "vibranium",
                "team": team
            }
        )
    )

    try:
        v1.create_namespace(ns)

        return {
            "created": f"team-{team}",
            "status": "success"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    
@app.get("/services")
def list_services():
    try:
        get_k8s_client()

        custom = CustomObjectsApi()

        rollouts = custom.list_cluster_custom_object(
            group="argoproj.io",
            version="v1alpha1",
            plural="rollouts"
        )

        services = []

        for r in rollouts.get("items", []):
            services.append({
                "name": r["metadata"]["name"],
                "namespace": r["metadata"]["namespace"],
                "status": r.get("status", {}).get("phase", "Unknown")
            })

        return {
            "services": services,
            "count": len(services)
        }

    except Exception as e:
        return {"error": str(e)}