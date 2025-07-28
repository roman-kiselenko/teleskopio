import { useCurrentClusterState } from '@/store/cluster';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';

interface AbstractPageProps<T> {
  getData: (kubeConfig: any, cluster: any, query: string) => Promise<void>;
  state: () => T[];
  columns: any;
  intervalMs?: number;
}

export const AbstractPage = <T,>({
  getData,
  state,
  columns,
  intervalMs = 1000,
}: AbstractPageProps<T>) => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getData(kubeConfig, cluster, query);
  }, [getData, kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [fetchData, intervalMs]);

  return <DataTable columns={columns} data={state()} />;
};
