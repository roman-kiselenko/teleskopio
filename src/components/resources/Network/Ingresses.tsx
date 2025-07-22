import { useCurrentClusterState } from '@/store/cluster';
import { useIngressesState, getIngresses } from '~/store/ingresses';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Network/Ingresses/Table/ColumnDef';

const Ingresses = () => {
  const cc = useCurrentClusterState();
  const ingressesState = useIngressesState();
  const searchQuery = useSearchState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getIngresses(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={ingressesState.ingresses.get()} />;
};

export default Ingresses;
