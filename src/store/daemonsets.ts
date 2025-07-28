import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { DaemonSet } from '@/types';

export const deamonSetsState = hookstate<Map<string, DaemonSet>>(new Map());

export async function getDaemonSets(path: string, context: string, query: string) {
  try {
    const daemonsets = await invoke<DaemonSet[]>('get_daemonsets', {
      path: path,
      context: context,
    });
    console.log('found daemonsets', daemonsets);
    deamonSetsState.set((prev) => {
      const newMap = new Map(prev);
      daemonsets.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load daemonsets\n' + error.message);
    console.log('Error! Cant load daemonsets\n' + error.message);
  }
}

export function useDaemonSetsState() {
  return useHookstate(deamonSetsState);
}
