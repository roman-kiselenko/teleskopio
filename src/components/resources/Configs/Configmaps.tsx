import { useCurrentClusterState } from '@/store/cluster';
import { useConfigmapsState, getConfigmaps } from '~/store/configmaps';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Configs/ConfigMaps/ColumnDef';

const Configmaps = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const configmapsState = useConfigmapsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getConfigmaps(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={configmapsState.configmaps.get()} />;
};

export default Configmaps;
