import { useCurrentClusterState } from '@/store/cluster';
import { useJobsState, getJobs } from '@/store/jobs';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Workloads/columns/Jobs';

const Jobs = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const jobsState = useJobsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getJobs(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={jobsState.jobs.get()} />;
};

export default Jobs;
