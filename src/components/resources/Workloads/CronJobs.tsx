import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useCronJobsState, cronJobsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/CronJobs';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { CronJob } from '@/types';

const globalCronJobsState = async () => {
  try {
    await invoke('start_cronjob_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<CronJob[]>('cronjob-update', (event) => {
    const cb = event.payload;
    cronJobsState.set(() => {
      const newMap = new Map();
      cb.forEach((p) => newMap.set(p.metadata.uid, p));
      return newMap;
    });
  });
};

const getCronJobsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[CronJob[], string | null]>('get_cronjobs_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const CronJobs = () => {
  const cronjobsState = useCronJobsState();
  globalCronJobsState();
  return (
    <PaginatedTable<CronJob>
      getPage={getCronJobsPage}
      state={() => cronjobsState.get() as Map<string, CronJob>}
      setState={cronjobsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default CronJobs;
