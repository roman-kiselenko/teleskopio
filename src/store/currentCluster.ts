import { hookstate, useHookstate } from '@hookstate/core';

const currentClusterState = hookstate<{
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
