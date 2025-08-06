import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { storageclassesState, useStorageClassesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Storage/columns/StorageClasses';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { StorageClass } from 'kubernetes-models/storage.k8s.io/v1';

const subscribeStorageClassEvents = async (rv: string) => {
  await invoke('storageclass_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenStorageClassEvents = async () => {
  await listen<StorageClass>('storageclass-deleted', (event) => {
    const ns = event.payload;
    storageclassesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ns.metadata?.uid as string);
      return newMap;
    });
  });

  await listen<StorageClass>('storageclass-updated', (event) => {
    const ns = event.payload;
    storageclassesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ns?.metadata?.uid as string, ns);
      return newMap;
    });
  });
};

const getStorageClassesPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[StorageClass[], string | null, string]>('get_storageclasses_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const StorageClasses = () => {
  const scState = useStorageClassesState();
  listenStorageClassEvents();
  return (
    <PaginatedTable<StorageClass>
      subscribeEvents={subscribeStorageClassEvents}
      getPage={getStorageClassesPage}
      state={() => scState.get() as Map<string, StorageClass>}
      setState={scState.set}
      extractKey={(p) => p?.metadata?.uid as string}
      columns={columns}
    />
  );
};

export default StorageClasses;
