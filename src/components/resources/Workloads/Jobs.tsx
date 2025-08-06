import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useJobsState, jobsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/Jobs';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Job } from 'kubernetes-models/batch/v1';

const subscribeJobEvents = async (rv: string) => {
  await invoke('job_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenJobEvents = async () => {
  await listen<Job>('job-deleted', (event) => {
    const job = event.payload;
    jobsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(job.metadata.uid);
      return newMap;
    });
  });

  await listen<Job>('job-updated', (event) => {
    const job = event.payload;
    jobsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(job.metadata.uid, job);
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
  return await invoke<[Job[], string | null, string]>('get_jobs_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Jobs = () => {
  const jobsState = useJobsState();
  listenJobEvents();
  return (
    <PaginatedTable<Job>
      subscribeEvents={subscribeJobEvents}
      getPage={getJobsPage}
      state={() => jobsState.get() as Map<string, Job>}
      setState={jobsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Jobs;
