from kubernetes import client, config


def get_k8s_client():
    try:
        config.load_incluster_config()  # running inside Kubernetes
    except Exception:
        config.load_kube_config()       # local development

    return client.CoreV1Api(), client.AppsV1Api()