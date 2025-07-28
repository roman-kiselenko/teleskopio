import { useCurrentClusterState } from '@/store/cluster';
import { useSecretsState, getSecrets } from '~/store/secrets';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Configs/columns/Secrets';

const Secrets = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const secretsState = useSecretsState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getSecrets(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={secretsState.secrets.get()} />;
};

export default Secrets;
