import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const statefulSetsState = hookstate<{ statefulsets: Object[] }>({
  statefulsets: [],
});

export async function getStatefulSets(path: string, context: string, query: string) {
  try {
    let statefulsets = await invoke<any>('get_statefulset', { path: path, context: context });
    statefulsets.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      statefulsets = statefulsets.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
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
