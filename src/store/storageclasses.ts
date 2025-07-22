import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const storageclassesState = hookstate<{ storageclasses: Object[] }>({
  storageclasses: [],
});

export async function getStorageClasses(path: string, context: string, query: string) {
  try {
    let storageclasses = await invoke<any>('get_storageclasses', { path: path, context: context });
    storageclasses.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      storageclasses = storageclasses.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    console.log('found storageclasses', storageclasses);
    storageclassesState.storageclasses.set(storageclasses);
  } catch (error: any) {
    toast.error('Error! Cant load storageclasses\n' + error.message);
    console.log('Error! Cant load storageclasses\n' + error.message);
  }
}

export function useStorageClassesState() {
  return useHookstate(storageclassesState);
}
