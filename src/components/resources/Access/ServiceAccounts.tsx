import { useCurrentClusterState } from '@/store/cluster';
import { useServiceAccountsState, getServiceAccounts } from '~/store/serviceaccounts';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Access/ServiceAccounts/ColumnDef';

const ServiceAccounts = () => {
  const cc = useCurrentClusterState();
  const saState = useServiceAccountsState();
  const searchQuery = useSearchState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getServiceAccounts(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={saState.serviceaccounts.get()} />;
};

export default ServiceAccounts;
