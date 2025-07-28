import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { Ingress } from '@/types';

export const ingressesState = hookstate<Map<string, Ingress>>(new Map());

export async function getIngresses(path: string, context: string, query: string) {
  try {
    const ingresses = await invoke<Ingress[]>('get_ingresses', { path: path, context: context });
    console.log('found ingresses', ingresses);
    ingressesState.set((prev) => {
      const newMap = new Map(prev);
      ingresses.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load ingresses\n' + error.message);
    console.log('Error! Cant load ingresses\n' + error.message);
  }
}

export function useIngressesState() {
  return useHookstate(ingressesState);
}
