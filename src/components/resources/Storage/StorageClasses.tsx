import { useCurrentClusterState } from '@/store/cluster';
import { useStorageClassesState, getStorageClasses } from '~/store/storageclasses';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import { useEffect, useCallback } from 'react';
import columns from '@/components/resources/Storage/StorageClasses/Table/ColumnDef';

const StorageClasses = () => {
  const cc = useCurrentClusterState();
  const storageClassesState = useStorageClassesState();
  const searchQuery = useSearchState();

  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getStorageClasses(kubeConfig, cluster, query);
  }, [kubeConfig, cluster, query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return <DataTable columns={columns} data={storageClassesState.storageclasses.get()} />;
};

export default StorageClasses;
