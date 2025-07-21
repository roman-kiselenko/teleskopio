import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const replicaSetsState = hookstate<{ replicasets: Object[] }>({
  replicasets: [],
});

export async function getReplicaSets(path: string, context: string, query: string) {
  try {
    let replicasets = await invoke<any>('get_replicaset', { path: path, context: context });
    replicasets.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      replicasets = replicasets.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
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
