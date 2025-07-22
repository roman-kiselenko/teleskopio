import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const ingressesState = hookstate<{ ingresses: Object[] }>({
  ingresses: [],
});

export async function getIngresses(path: string, context: string, query: string) {
  try {
    let ingresses = await invoke<any>('get_ingresses', { path: path, context: context });
    ingresses.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      ingresses = ingresses.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    console.log('found ingresses', ingresses);
    ingressesState.ingresses.set(ingresses);
  } catch (error: any) {
    toast.error('Error! Cant load ingresses\n' + error.message);
    console.log('Error! Cant load ingresses\n' + error.message);
  }
}

export function useIngressesState() {
  return useHookstate(ingressesState);
}
