import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const deamonSetsState = hookstate<{ daemonsets: Object[] }>({
  daemonsets: [],
});

export async function getDaemonSets(path: string, context: string, query: string) {
  try {
    let daemonsets = await invoke<any>('get_daemonset', { path: path, context: context });
    daemonsets.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      daemonsets = daemonsets.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    console.log('found daemonsets', daemonsets);
    deamonSetsState.daemonsets.set(daemonsets);
  } catch (error: any) {
    toast.error('Error! Cant load daemonsets\n' + error.message);
    console.log('Error! Cant load daemonsets\n' + error.message);
  }
}

export function useDaemonSetsState() {
  return useHookstate(deamonSetsState);
}
