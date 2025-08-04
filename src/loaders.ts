import { invoke } from '@tauri-apps/api/core';
import { currentClusterState } from '@/store/cluster';

export async function LoadPod(namespace: string, name: string) {
  return invoke<any>('get_one_pod', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadDeployment(namespace: string, name: string) {
  return invoke<any>('get_one_deployment', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadReplicaSet(namespace: string, name: string) {
  return invoke<any>('get_one_replicaset', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadStatefulSet(namespace: string, name: string) {
  return invoke<any>('get_one_statefulset', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadJob(namespace: string, name: string) {
  return invoke<any>('get_one_job', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadCronJob(namespace: string, name: string) {
  return invoke<any>('get_one_cronjob', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadDaemonSet(namespace: string, name: string) {
  return invoke<any>('get_one_daemonset', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadNode(name: string) {
  return invoke<any>('get_one_node', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    name: name,
  });
}

export async function LoadConfigMap(namespace: string, name: string) {
  return invoke<any>('get_one_configmap', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadSecret(namespace: string, name: string) {
  return invoke<any>('get_one_secret', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    ns: namespace,
    name: name,
  });
}

export async function LoadNamespace(name: string) {
  return invoke<any>('get_one_namespace', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    name: name,
  });
}

export async function LoadService(namespace: string, name: string) {
  return invoke<any>('get_one_service', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    name: name,
    ns: namespace,
  });
}

export async function LoadIngress(namespace: string, name: string) {
  return invoke<any>('get_one_ingress', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    name: name,
    ns: namespace,
  });
}

export async function LoadNetworkPolicy(namespace: string, name: string) {
  return invoke<any>('get_one_networkpolicy', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    name: name,
    ns: namespace,
  });
}

export async function LoadRole(namespace: string, name: string) {
  return invoke<any>('get_one_role', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    name: name,
    ns: namespace,
  });
}

export async function LoadServiceAccount(namespace: string, name: string) {
  return invoke<any>('get_one_serviceaccount', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    name: name,
    ns: namespace,
  });
}
