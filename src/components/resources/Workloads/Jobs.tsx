import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useJobsState, jobsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/Jobs';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Job } from '@/types';

const globalJobsState = async () => {
  try {
    await invoke('start_job_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<Job[]>('job-update', (event) => {
    const cj = event.payload;
    jobsState.set(() => {
      const newMap = new Map();
      cj.forEach((p) => newMap.set(p.metadata.uid, p));
      return newMap;
    });
  });
};

const getJobsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Job[], string | null]>('get_jobs_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Jobs = () => {
  const jobsState = useJobsState();
  globalJobsState();
  return (
    <PaginatedTable<Job>
      getPage={getJobsPage}
      state={() => jobsState.get() as Map<string, Job>}
      setState={jobsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Jobs;
