import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const pvsState = hookstate<{ pvs: Object[] }>({
  pvs: [],
});

export async function getPvs(path: string, context: string) {
  try {
    const pvs = await invoke<any>('get_pvs', { path: path, context: context });
    console.log('found pvs', pvs);
    pvsState.pvs.set(pvs);
  } catch (error: any) {
    toast.error('Error! Cant load pvs\n' + error.message);
    console.log('Error! Cant load pvs\n' + error.message);
  }
}

export function usePvsState() {
  return useHookstate(pvsState);
}
