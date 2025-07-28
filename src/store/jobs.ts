import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { Job } from '@/types';

export const jobsState = hookstate<Map<string, Job>>(new Map());

export async function getJobs(path: string, context: string, query: string) {
  try {
    const jobs = await invoke<Job[]>('get_jobs', { path: path, context: context });
    console.log('found jobs', jobs);
    jobsState.set((prev) => {
      const newMap = new Map(prev);
      jobs.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load jobs\n' + error.message);
    console.log('Error! Cant load jobs\n' + error.message);
  }
}

export function useJobsState() {
  return useHookstate(jobsState);
}
