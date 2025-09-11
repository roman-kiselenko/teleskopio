import { hookstate, useHookstate } from '@hookstate/core';

export const currentClusterState = hookstate<{
  server: string;
}>({
  server: '',
});

export function useCurrentClusterState() {
  return useHookstate(currentClusterState);
}

export function setCurrentCluster(server: any) {
  currentClusterState.server.set(server);
}

export function getCurrentCluster(): boolean {
  return currentClusterState.server.get() === '';
}
