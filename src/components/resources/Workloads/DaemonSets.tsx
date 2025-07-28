import { useCurrentClusterState } from '@/store/cluster';
import { useDaemonSetsState, getDaemonSets } from '@/store/daemonsets';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Workloads/columns/DaemonSets';

const DaemonSets = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const daemonSetsState = useDaemonSetsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getDaemonSets(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={daemonSetsState.daemonsets.get()} />;
};

export default DaemonSets;
