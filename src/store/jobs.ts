import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const jobsState = hookstate<{ jobs: Object[] }>({
  jobs: [],
});

export async function getJobs(path: string, context: string) {
  try {
    const jobs = await invoke<any>('get_jobs', { path: path, context: context });
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
