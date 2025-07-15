import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const ingressesState = hookstate<{ ingresses: Object[] }>({
  ingresses: [],
});

export async function getIngresses(path: string, context: string) {
  try {
    const ingresses = await invoke<any>('get_ingresses', { path: path, context: context });
    console.log('found ingresses', ingresses);
    ingressesState.ingresses.set(ingresses);
  } catch (error: any) {
    toast.error('Error! Cant load ingresses\n' + error.message);
    console.log('Error! Cant load ingresses\n' + error.message);
  }
}

export function useIngressesState() {
  return useHookstate(ingressesState);
}
