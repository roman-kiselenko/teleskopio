import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const configmapsState = hookstate<{ configmaps: Object[] }>({
  configmaps: [],
});

export async function getConfigmaps(path: string, context: string) {
  try {
    const configmaps = await invoke<any>('get_configmaps', { path: path, context: context });
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
