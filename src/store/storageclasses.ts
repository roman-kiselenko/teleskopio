import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { StorageClass } from '@/types';

export const storageclassesState = hookstate<Map<string, StorageClass>>(new Map());

export async function getStorageClasses(path: string, context: string, query: string) {
  try {
    const storageclasses = await invoke<StorageClass[]>('get_storageclasses', {
      path: path,
      context: context,
    });
    console.log('found storageclasses', storageclasses);
    storageclassesState.set((prev) => {
      const newMap = new Map(prev);
      storageclasses.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load storageclasses\n' + error.message);
    console.log('Error! Cant load storageclasses\n' + error.message);
  }
}

export function useStorageClassesState() {
  return useHookstate(storageclassesState);
}
