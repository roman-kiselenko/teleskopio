import { useCurrentClusterState } from '@/store/cluster';
import { useReplicaSetsState, getReplicaSets } from '@/store/replicasets';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Workloads/columns/ReplicaSets';

const ReplicaSets = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const replicaSetsState = useReplicaSetsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getReplicaSets(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={replicaSetsState.replicasets.get()} />;
};

export default ReplicaSets;
