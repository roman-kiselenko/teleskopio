import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const jobsState = hookstate<{ jobs: Object[] }>({
  jobs: [],
});

export async function getJobs(path: string, context: string, query: string) {
  try {
    let jobs = await invoke<any>('get_jobs', { path: path, context: context });
    jobs.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      jobs = jobs.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    console.log('found jobs', jobs);
    jobsState.jobs.set(jobs);
  } catch (error: any) {
    toast.error('Error! Cant load jobs\n' + error.message);
    console.log('Error! Cant load jobs\n' + error.message);
  }
}

export function useJobsState() {
  return useHookstate(jobsState);
}
