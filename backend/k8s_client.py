from kubernetes import client, config, dynamic
from kubernetes.client import ApiClient
import os

class K8sClient:
    def __init__(self):
        try:
            config.load_incluster_config()
        except:
            config.load_kube_config()
        self.core   = client.CoreV1Api()
        self.apps   = client.AppsV1Api()
        self.dynamic = dynamic.DynamicClient(ApiClient())

    # ── namespaces ────────────────────────────────────────────────────────────

    def create_namespace(self, name: str):
        ns = client.V1Namespace(metadata=client.V1ObjectMeta(name=name))
        try:
            return self.core.create_namespace(ns)
        except client.exceptions.ApiException as e:
            if e.status == 409:
                return None  # already exists, fine
            raise

    # ── deployments ───────────────────────────────────────────────────────────

    def apply_deployment(self, manifest: dict):
        namespace = manifest["metadata"]["namespace"]
        name      = manifest["metadata"]["name"]
        resource  = self.dynamic.resources.get(api_version="apps/v1", kind="Deployment")
        try:
            resource.create(body=manifest, namespace=namespace)
        except Exception as e:
            if "already exists" in str(e):
                resource.patch(body=manifest, name=name, namespace=namespace,
                               content_type="application/merge-patch+json")
            else:
                raise

    # ── services ──────────────────────────────────────────────────────────────

    def apply_service(self, manifest: dict):
        namespace = manifest["metadata"]["namespace"]
        name      = manifest["metadata"]["name"]
        resource  = self.dynamic.resources.get(api_version="v1", kind="Service")
        try:
            resource.create(body=manifest, namespace=namespace)
        except Exception as e:
            if "already exists" in str(e):
                resource.patch(body=manifest, name=name, namespace=namespace,
                               content_type="application/merge-patch+json")
            else:
                raise

    # ── argo rollouts ─────────────────────────────────────────────────────────

    def apply_rollout(self, manifest: dict):
        namespace = manifest["metadata"]["namespace"]
        name      = manifest["metadata"]["name"]
        resource  = self.dynamic.resources.get(
            api_version="argoproj.io/v1alpha1", kind="Rollout"
        )
        try:
            resource.create(body=manifest, namespace=namespace)
        except Exception as e:
            if "already exists" in str(e):
                resource.patch(body=manifest, name=name, namespace=namespace,
                               content_type="application/merge-patch+json")
            else:
                raise

    # ── configmaps ────────────────────────────────────────────────────────────

    def apply_configmap(self, manifest: dict):
        namespace = manifest["metadata"]["namespace"]
        name      = manifest["metadata"]["name"]
        resource  = self.dynamic.resources.get(api_version="v1", kind="ConfigMap")
        try:
            resource.create(body=manifest, namespace=namespace)
        except Exception as e:
            if "already exists" in str(e):
                resource.patch(body=manifest, name=name, namespace=namespace,
                               content_type="application/merge-patch+json")
            else:
                raise

    # ── list rollouts ─────────────────────────────────────────────────────────

    def list_rollouts(self):
        try:
            resource = self.dynamic.resources.get(
                api_version="argoproj.io/v1alpha1", kind="Rollout"
            )
            rollouts = resource.get()
            results = []
            for r in rollouts.items:
                results.append({
                    "name":      r.metadata.name,
                    "namespace": r.metadata.namespace,
                    "replicas":  r.spec.replicas,
                    "status":    r.status.phase if r.status else "Unknown",
                })
            return results
        except Exception as e:
            return []
