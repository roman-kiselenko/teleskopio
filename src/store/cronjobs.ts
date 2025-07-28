import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { CronJob } from '@/types';

export const cronJobsState = hookstate<Map<string, CronJob>>(new Map());

export async function getCronJobs(path: string, context: string, query: string) {
  try {
    const cronjobs = await invoke<CronJob[]>('get_cronjobs', { path: path, context: context });
    console.log('found cronjobs', cronjobs);
    cronJobsState.set((prev) => {
      const newMap = new Map(prev);
      cronjobs.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load cronjobs\n' + error.message);
    console.log('Error! Cant load cronjobs\n' + error.message);
  }
}

export function useCronJobsState() {
  return useHookstate(cronJobsState);
}
