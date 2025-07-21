import { useCurrentClusterState } from '@/store/cluster';
import { useStatefulSetsState, getStatefulSets } from '@/store/statefulsets';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Workloads/StatefulSets/Table/ColumnDef';

const StatefulSets = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const statefulSetsState = useStatefulSetsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getStatefulSets(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={statefulSetsState.statefulsets.get()} />;
};

export default StatefulSets;
