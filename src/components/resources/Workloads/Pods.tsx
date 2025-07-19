import { useCurrentClusterState } from '@/store/cluster';
import { usePodsState, getPods } from '~/store/pods';
import { useEffect, useCallback } from 'react';
import { DataTable } from '@/components/resources/Workloads/Pods/DataTable';
import columns from '@/components/resources/Workloads/Pods/Table/ColumnDef';
const Pods = () => {
  const cc = useCurrentClusterState();
  const podsState = usePodsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();

  const fetchData = useCallback(async () => {
    await getPods(kubeConfig, cluster);
  }, [kubeConfig, cluster]);

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
