import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useCronJobsState, cronJobsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/CronJobs';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { CronJob } from '@/types';

const subscribeCronJobEvents = async (rv: string) => {
  await invoke('start_cronjob_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenCronJobEvents = async () => {
  await listen<CronJob>('cronjob-deleted', (event) => {
    const cj = event.payload;
    cronJobsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cj.metadata.uid);
      return newMap;
    });
  });

  await listen<CronJob>('cronjob-updated', (event) => {
    const cj = event.payload;
    cronJobsState.set(() => {
      const newMap = new Map();
      newMap.set(cj.metadata.uid, cj);
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
  return await invoke<[CronJob[], string | null, string]>('get_cronjobs_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const CronJobs = () => {
  const cronjobsState = useCronJobsState();
  listenCronJobEvents();
  return (
    <PaginatedTable<CronJob>
      subscribeEvents={subscribeCronJobEvents}
      getPage={getCronJobsPage}
      state={() => cronjobsState.get() as Map<string, CronJob>}
      setState={cronjobsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default CronJobs;
