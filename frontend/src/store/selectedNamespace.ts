import { hookstate, useHookstate } from '@hookstate/core';

export const selectedNamespaceState = hookstate<string | null>(null);

export function useSelectedNamespacesState() {
  return useHookstate(selectedNamespaceState);
}
