import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const podsState = hookstate<{ pods: Object[] }>({
  pods: [],
});

export async function getPods(path: string, context: string) {
  try {
    const pods = await invoke<any>('get_pods', { path: path, context: context });
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
