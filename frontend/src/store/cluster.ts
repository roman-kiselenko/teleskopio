import { hookstate, useHookstate } from '@hookstate/core';

export const currentClusterState = hookstate<{
  context: string;
  server: string;
}>({
  context: '',
  server: '',
});

export function useCurrentClusterState() {
  return useHookstate(currentClusterState);
}

export function setCurrentCluster(cluster: string, server: string) {
  currentClusterState.context.set(cluster);
  currentClusterState.server.set(server);
}

export function getKubeconfig(): any {
  return currentClusterState.server.get();
}

export function getCluster(): any {
  return currentClusterState.context.get();
}

export function getCurrentCluster(): any {
  const cluster = currentClusterState.context.get();
  const server = currentClusterState.server.get();
  return cluster === '' || server === '';
}
