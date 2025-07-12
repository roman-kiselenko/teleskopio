import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const cronJobsState = hookstate<{ cronjobs: Object[] }>({
  cronjobs: [],
});

export async function getCronJobs(path: string, context: string) {
  try {
    const cronjobs = await invoke<any>('get_cronjobs', { path: path, context: context });
    console.log('found cronjobs', cronjobs);
    cronJobsState.cronjobs.set(cronjobs);
  } catch (error: any) {
    toast.error('Error! Cant load cronjobs\n' + error.message);
    console.log('Error! Cant load cronjobs\n' + error.message);
  }
}

export function useCronJobsState() {
  return useHookstate(cronJobsState);
}
