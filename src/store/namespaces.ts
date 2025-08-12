import { hookstate, useHookstate } from '@hookstate/core';

type Namespace = {
  metadata: {
    name: string;
    [key: string]: any;
  };
  [key: string]: any;
};
export const namespacesState = hookstate<Namespace[]>([]);

export function useNamespacesState() {
  return useHookstate(namespacesState);
}

export const selectedNamespaceState = hookstate<string | null>(null);

export function useSelectedNamespacesState() {
  return useHookstate(selectedNamespaceState);
}
