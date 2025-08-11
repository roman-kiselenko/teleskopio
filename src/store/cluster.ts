import { hookstate, useHookstate } from '@hookstate/core';

export const currentClusterState = hookstate<{
  context: string;
  kube_config: string;
}>({
  context: '',
  kube_config: '',
});

export function useCurrentClusterState() {
  return useHookstate(currentClusterState);
}

export function setCurrentCluster(cluster: string, path: string) {
  currentClusterState.context.set(cluster);
  currentClusterState.kube_config.set(path);
}

export function getKubeconfig(): any {
  return currentClusterState.kube_config.get();
}

export function getCluster(): any {
  return currentClusterState.context.get();
}

export function getCurrentCluster(): any {
  const cluster = currentClusterState.context.get();
  const kube_config = currentClusterState.kube_config.get();
  return cluster === '' || kube_config === '';
}
