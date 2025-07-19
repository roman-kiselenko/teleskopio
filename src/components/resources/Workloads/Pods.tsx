import { useCurrentClusterState } from '@/store/cluster';
import { usePodsState, getPods } from '~/store/pods';
import { useSearchState } from '@/store/search';
import { useEffect, useCallback } from 'react';
import { DataTable } from '@/components/resources/Workloads/Pods/DataTable';
import columns from '@/components/resources/Workloads/Pods/Table/ColumnDef';
const Pods = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const podsState = usePodsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getPods(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div>
      <DataTable columns={columns} data={podsState.pods.get()} />
    </div>
  );
};

export default Pods;
