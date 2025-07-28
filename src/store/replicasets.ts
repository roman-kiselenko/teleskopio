import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { ReplicaSet } from '@/types';

export const replicaSetsState = hookstate<Map<string, ReplicaSet>>(new Map());

export async function getReplicaSets(path: string, context: string, query: string) {
  try {
    const replicasets = await invoke<ReplicaSet[]>('get_replicaset', {
      path: path,
      context: context,
    });
    console.log('found replicasets', replicasets);
    replicaSetsState.set((prev) => {
      const newMap = new Map(prev);
      replicasets.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load replicasets\n' + error.message);
    console.log('Error! Cant load replicasets\n' + error.message);
  }
}

export function useReplicaSetsState() {
  return useHookstate(replicaSetsState);
}
