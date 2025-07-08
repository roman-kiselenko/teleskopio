import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';

export const namespacesState = hookstate(async () => {
  const namespaces = await invoke('get_namespaces');
  return {
    namespaces: namespaces,
  };
});

export function useNamespaceState() {
  return useHookstate(namespacesState);
}
