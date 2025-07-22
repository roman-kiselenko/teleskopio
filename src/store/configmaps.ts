import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const configmapsState = hookstate<{ configmaps: Object[] }>({
  configmaps: [],
});

export async function getConfigmaps(path: string, context: string, query: string) {
  try {
    let configmaps = await invoke<any>('get_configmaps', { path: path, context: context });
    configmaps.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      configmaps = configmaps.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    console.log('found configmaps', configmaps);
    configmapsState.configmaps.set(configmaps);
  } catch (error: any) {
    toast.error('Error! Cant load configmaps\n' + error.message);
    console.log('Error! Cant load configmaps\n' + error.message);
  }
}

export function useConfigmapsState() {
  return useHookstate(configmapsState);
}
