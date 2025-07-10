import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';

export const namespacesState = hookstate<{ namespaces: Object[] }>({
  namespaces: [],
});

export async function getNamespaces(path: string, context: string) {
  try {
    let namespaces = await invoke<any>('get_namespaces', { path: path, context: context });
    console.log('found namespaces', namespaces);
    namespacesState.namespaces.set([{ metadata: { name: 'all' } }].concat(namespaces));
  } catch (error: any) {
    console.log('Error! Cant load namespaces\n' + error.message);
  }
}

export function useNamespacesState() {
  return useHookstate(namespacesState);
}
