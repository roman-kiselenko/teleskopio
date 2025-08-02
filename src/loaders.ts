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
