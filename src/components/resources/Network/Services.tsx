import { useCurrentClusterState } from '@/store/cluster';
import { useServicesState, getServices } from '~/store/services';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Network/Services/Table/ColumnDef';

const Services = () => {
  const cc = useCurrentClusterState();
  const servicesState = useServicesState();
  const searchQuery = useSearchState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getServices(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={servicesState.services.get()} />;
};

export default Services;
