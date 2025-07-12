import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const statefulSetsState = hookstate<{ statefulsets: Object[] }>({
  statefulsets: [],
});

export async function getStatefulSets(path: string, context: string) {
  try {
    const statefulsets = await invoke<any>('get_statefulset', { path: path, context: context });
    console.log('found statefulsets', statefulsets);
    statefulSetsState.statefulsets.set(statefulsets);
  } catch (error: any) {
    toast.error('Error! Cant load statefulsets\n' + error.message);
    console.log('Error! Cant load statefulsets\n' + error.message);
  }
}

export function useStatefulSetsState() {
  return useHookstate(statefulSetsState);
}
