import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const podsState = hookstate<{ pods: Object[] }>({
  pods: [],
});

export async function getPods(path: string, context: string, query: string) {
  try {
    let pods = await invoke<any>('get_pods', { path: path, context: context });
    pods.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      pods = pods.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    console.log('found pods', pods);
    podsState.pods.set(pods);
  } catch (error: any) {
    toast.error('Error! Cant load pods\n' + error.message);
    console.log('Error! Cant load pods\n' + error.message);
  }
}

export function usePodsState() {
  return useHookstate(podsState);
}
