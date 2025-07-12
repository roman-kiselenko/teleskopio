import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const deamonSetsState = hookstate<{ daemonsets: Object[] }>({
  daemonsets: [],
});

export async function getDaemonSets(path: string, context: string) {
  try {
    const daemonsets = await invoke<any>('get_daemonset', { path: path, context: context });
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
