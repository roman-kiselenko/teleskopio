import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { StatefulSet } from '@/types';

export const statefulSetsState = hookstate<Map<string, StatefulSet>>(new Map());

export async function getStatefulSets(path: string, context: string, query: string) {
  try {
    const statefulsets = await invoke<StatefulSet[]>('get_statefulsets', {
      path: path,
      context: context,
    });
    console.log('found statefulsets', statefulsets);
    statefulSetsState.set((prev) => {
      const newMap = new Map(prev);
      statefulsets.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load statefulsets\n' + error.message);
    console.log('Error! Cant load statefulsets\n' + error.message);
  }
}

export function useStatefulSetsState() {
  return useHookstate(statefulSetsState);
}
