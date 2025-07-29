import { hookstate, useHookstate } from '@hookstate/core';

export const currentClusterState = hookstate<{
  cluster: string;
  kube_config: string;
}>({
  cluster: '',
  kube_config: '',
});

export function useCurrentClusterState() {
  return useHookstate(currentClusterState);
}

export function setCurrentCluster(cluster: string, path: string) {
  currentClusterState.cluster.set(cluster);
  currentClusterState.kube_config.set(path);
}

export function getKubeconfig(): any {
  return currentClusterState.kube_config.get();
}

export function getCluster(): any {
  return currentClusterState.cluster.get();
}

export function getCurrentCluster(): any {
  const cluster = currentClusterState.cluster.get();
  const kube_config = currentClusterState.kube_config.get();
  return cluster === '' || kube_config === '';
}
