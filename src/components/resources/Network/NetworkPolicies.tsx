import { useCurrentClusterState } from '@/store/cluster';
import { useNetworkPoliciesState, getNetworkPolicies } from '~/store/networkpolicies';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Network/NetworkPolicies/Table/ColumnDef';

const Networkpolicies = () => {
  const cc = useCurrentClusterState();
  const npState = useNetworkPoliciesState();
  const searchQuery = useSearchState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getNetworkPolicies(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={npState.networkpolicies.get()} />;
};

export default Networkpolicies;
