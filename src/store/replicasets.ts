import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const replicaSetsState = hookstate<{ replicasets: Object[] }>({
  replicasets: [],
});

export async function getReplicaSets(path: string, context: string) {
  try {
    const replicasets = await invoke<any>('get_replicaset', { path: path, context: context });
    console.log('found replicasets', replicasets);
    replicaSetsState.replicasets.set(replicasets);
  } catch (error: any) {
    toast.error('Error! Cant load replicasets\n' + error.message);
    console.log('Error! Cant load replicasets\n' + error.message);
  }
}

export function useReplicaSetsState() {
  return useHookstate(replicaSetsState);
}
