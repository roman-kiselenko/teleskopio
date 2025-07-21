import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const cronJobsState = hookstate<{ cronjobs: Object[] }>({
  cronjobs: [],
});

export async function getCronJobs(path: string, context: string, query: string) {
  try {
    let cronjobs = await invoke<any>('get_cronjobs', { path: path, context: context });
    cronjobs.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      cronjobs = cronjobs.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
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
