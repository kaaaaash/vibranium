"""
k8s_client.py — Option B+
All K8s resources built and applied via the Python SDK.
No Helm. No subprocess. No YAML files written to disk.
"""

from kubernetes import client, config
from kubernetes.client.rest import ApiException


# ---------- Config ----------

def _load_config():
    try:
        config.load_incluster_config()
    except Exception:
        config.load_kube_config()


def get_k8s_clients():
    _load_config()
    return {
        "core": client.CoreV1Api(),
        "apps": client.AppsV1Api(),
        "custom": client.CustomObjectsApi(),
    }


# ---------- Namespace ----------

def create_namespace(name: str) -> str:
    _load_config()
    v1 = client.CoreV1Api()
    ns = client.V1Namespace(
        metadata=client.V1ObjectMeta(
            name=name,
            labels={"managed-by": "vibranium"},
        )
    )
    try:
        v1.create_namespace(ns)
        return f"namespace/{name} created"
    except ApiException as e:
        if e.status == 409:
            return f"namespace/{name} already exists"
        raise


# ---------- Service (ClusterIP) ----------

def create_service(name: str, namespace: str, port: int) -> str:
    _load_config()
    v1 = client.CoreV1Api()
    svc = client.V1Service(
        metadata=client.V1ObjectMeta(
            name=name,
            namespace=namespace,
            labels={"app": name, "managed-by": "vibranium"},
        ),
        spec=client.V1ServiceSpec(
            selector={"app": name},
            ports=[client.V1ServicePort(port=port, target_port=port)],
            type="ClusterIP",
        ),
    )
    try:
        v1.create_namespaced_service(namespace=namespace, body=svc)
        return f"service/{name} created"
    except ApiException as e:
        if e.status == 409:
            return f"service/{name} already exists"
        raise


# ---------- Deployment ----------

def create_deployment(name: str, namespace: str, image: str, port: int, replicas: int) -> str:
    _load_config()
    apps = client.AppsV1Api()
    deploy = client.V1Deployment(
        metadata=client.V1ObjectMeta(
            name=name,
            namespace=namespace,
            labels={"app": name, "managed-by": "vibranium"},
        ),
        spec=client.V1DeploymentSpec(
            replicas=replicas,
            selector=client.V1LabelSelector(match_labels={"app": name}),
            template=client.V1PodTemplateSpec(
                metadata=client.V1ObjectMeta(labels={"app": name}),
                spec=client.V1PodSpec(
                    containers=[
                        client.V1Container(
                            name=name,
                            image=image,
                            ports=[client.V1ContainerPort(container_port=port)],
                            resources=client.V1ResourceRequirements(
                                requests={"cpu": "50m", "memory": "64Mi"},
                                limits={"cpu": "200m", "memory": "256Mi"},
                            ),
                            readiness_probe=client.V1Probe(
                                http_get=client.V1HTTPGetAction(
                                    path="/health",
                                    port=port,
                                ),
                                initial_delay_seconds=5,
                                period_seconds=10,
                            ),
                        )
                    ]
                ),
            ),
        ),
    )
    try:
        apps.create_namespaced_deployment(namespace=namespace, body=deploy)
        return f"deployment/{name} created"
    except ApiException as e:
        if e.status == 409:
            return f"deployment/{name} already exists"
        raise


# ---------- Argo Rollout ----------

ROLLOUT_CANARY_STEPS = [
    {"setWeight": 20},
    {"pause": {"duration": "30s"}},
    {"setWeight": 40},
    {"pause": {"duration": "30s"}},
    {"setWeight": 60},
    {"pause": {"duration": "30s"}},
    {"setWeight": 80},
    {"pause": {"duration": "30s"}},
]


def create_rollout(name: str, namespace: str, image: str, port: int, replicas: int) -> str:
    _load_config()
    custom = client.CustomObjectsApi()

    rollout_body = {
        "apiVersion": "argoproj.io/v1alpha1",
        "kind": "Rollout",
        "metadata": {
            "name": name,
            "namespace": namespace,
            "labels": {"app": name, "managed-by": "vibranium"},
        },
        "spec": {
            "replicas": replicas,
            "selector": {"matchLabels": {"app": name}},
            "template": {
                "metadata": {"labels": {"app": name}},
                "spec": {
                    "containers": [
                        {
                            "name": name,
                            "image": image,
                            "ports": [{"containerPort": port}],
                            "resources": {
                                "requests": {"cpu": "50m", "memory": "64Mi"},
                                "limits": {"cpu": "200m", "memory": "256Mi"},
                            },
                        }
                    ]
                },
            },
            "strategy": {
                "canary": {
                    "steps": ROLLOUT_CANARY_STEPS,
                }
            },
        },
    }

    try:
        custom.create_namespaced_custom_object(
            group="argoproj.io",
            version="v1alpha1",
            namespace=namespace,
            plural="rollouts",
            body=rollout_body,
        )
        return f"rollout/{name} created"
    except ApiException as e:
        if e.status == 409:
            return f"rollout/{name} already exists"
        raise


# ---------- Rollout status ----------

def get_rollout_status(name: str, namespace: str) -> dict | None:
    _load_config()
    custom = client.CustomObjectsApi()
    try:
        rollout = custom.get_namespaced_custom_object(
            group="argoproj.io",
            version="v1alpha1",
            namespace=namespace,
            plural="rollouts",
            name=name,
        )
    except ApiException as e:
        if e.status == 404:
            return None
        raise

    status = rollout.get("status", {})
    spec   = rollout.get("spec", {})

    return {
        "name": name,
        "namespace": namespace,
        "phase": status.get("phase", "Unknown"),
        "replicas": {
            "desired": status.get("replicas", 0),
            "ready": status.get("readyReplicas", 0),
            "available": status.get("availableReplicas", 0),
            "updated": status.get("updatedReplicas", 0),
        },
        "canary": {
            "current_step": status.get("currentStepIndex"),
            "total_steps": len(spec.get("strategy", {}).get("canary", {}).get("steps", [])),
            "weight": status.get("currentPodHash"),  # placeholder — enrich in day 5
        },
        "conditions": [
            {"type": c.get("type"), "status": c.get("status"), "reason": c.get("reason")}
            for c in status.get("conditions", [])
        ],
        "message": status.get("message", ""),
    }


# ---------- List all rollouts ----------

def list_all_rollouts() -> list[dict]:
    _load_config()
    custom = client.CustomObjectsApi()
    try:
        result = custom.list_cluster_custom_object(
            group="argoproj.io",
            version="v1alpha1",
            plural="rollouts",
        )
    except ApiException:
        return []

    services = []
    for item in result.get("items", []):
        meta   = item.get("metadata", {})
        status = item.get("status", {})
        services.append({
            "name": meta.get("name"),
            "namespace": meta.get("namespace"),
            "phase": status.get("phase", "Unknown"),
            "ready": status.get("readyReplicas", 0),
            "desired": status.get("replicas", 0),
        })
    return services


# ---------- Rollback ----------

def rollback_rollout(name: str, namespace: str) -> str:
    """
    Abort the active canary and restore stable.
    Argo Rollouts abort = sets phase to Aborted, stable pods take full traffic.
    """
    _load_config()
    custom = client.CustomObjectsApi()
    patch = {
        "spec": {
            "abort": True
        }
    }
    try:
        custom.patch_namespaced_custom_object(
            group="argoproj.io",
            version="v1alpha1",
            namespace=namespace,
            plural="rollouts",
            name=name,
            body=patch,
        )
        return f"rollout/{name} aborted — stable version restored"
    except ApiException as e:
        raise Exception(f"Rollback failed: {e.reason}")
    

    # ---------- Harvey Integration (link generation) ----------

HARVEY_URLS = {
    "grafana": "http://grafana.harvey.svc.cluster.local:3000",
    "prometheus": "http://prometheus.harvey.svc.cluster.local:9090",
    "kiali": "http://kiali.harvey.svc.cluster.local:20001",
}

def get_harvey_links(name: str, namespace: str) -> dict:
    """
    Generate pre-filtered Harvey monitoring links for a service.
    Links are constructed with the service name baked in — no live query needed.
    """
    grafana_url = (
        f"{HARVEY_URLS['grafana']}/d/vibranium-service"
        f"?var-service={name}&var-namespace={namespace}"
    )
    prometheus_url = (
        f"{HARVEY_URLS['prometheus']}/graph"
        f"?g0.expr=rate(http_requests_total{{service%3D%22{name}%22}}[5m])"
        f"&g0.tab=0"
    )
    kiali_url = (
        f"{HARVEY_URLS['kiali']}/kiali/console/namespaces/{namespace}/services/{name}"
    )

    return {
        "grafana": grafana_url,
        "prometheus": prometheus_url,
        "kiali": kiali_url,
    }


def get_service_metrics(name: str, namespace: str) -> dict:
    """
    Returns metrics for a service.
    When Prometheus is reachable, query live.
    When not (dev cluster, no Harvey), return structured placeholder.
    """
    # Attempt live Prometheus query
    import httpx
    prom_base = HARVEY_URLS["prometheus"]
    metrics = {}

    queries = {
        "request_rate": f'rate(http_requests_total{{service="{name}"}}[5m])',
        "error_rate": f'rate(http_requests_total{{service="{name}",status=~"5.."}}[5m])',
        "p99_latency": f'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{{service="{name}"}}[5m]))',
    }

    for metric_name, query in queries.items():
        try:
            resp = httpx.get(
                f"{prom_base}/api/v1/query",
                params={"query": query},
                timeout=2.0,
            )
            result = resp.json().get("data", {}).get("result", [])
            metrics[metric_name] = float(result[0]["value"][1]) if result else None
        except Exception:
            metrics[metric_name] = None  # Prometheus not reachable — expected in dev

    return {
        "service": name,
        "namespace": namespace,
        "metrics": metrics,
        "note": "null values indicate Prometheus not reachable in this environment — links are live",
        "links": get_harvey_links(name, namespace),
    }