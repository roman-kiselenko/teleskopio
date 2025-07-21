import { useCurrentClusterState } from '@/store/cluster';
import { useCronJobsState, getCronJobs } from '@/store/cronjobs';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Workloads/CronJobs/Table/ColumnDef';

const CronJobs = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const cronJobsState = useCronJobsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getCronJobs(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={cronJobsState.cronjobs.get()} />;
};

export default CronJobs;
