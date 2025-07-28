import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { ConfigMap } from '@/types';

export const configmapsState = hookstate<Map<string, ConfigMap>>(new Map());

export async function getConfigmaps(path: string, context: string, query: string) {
  try {
    const configmaps = await invoke<ConfigMap[]>('get_configmaps', {
      path: path,
      context: context,
    });
    console.log('found configmaps', configmaps);
    configmapsState.set((prev) => {
      const newMap = new Map(prev);
      configmaps.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load configmaps\n' + error.message);
    console.log('Error! Cant load configmaps\n' + error.message);
  }
}

export function useConfigmapsState() {
  return useHookstate(configmapsState);
}
