import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useNamespacesState, namespacesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Configs/columns/Namespaces';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Namespace } from '@/types';

const subscribeNamespacesEvents = async (rv: string) => {
  await invoke('namespace_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenNamespaceEvents = async () => {
  await listen<Namespace>('namespace-deleted', (event) => {
    const ns = event.payload;
    namespacesState.set(() => {
      const newMap = new Map();
      newMap.delete(ns.metadata.uid);
      return newMap;
    });
  });

  await listen<Namespace>('namespace-updated', (event) => {
    const ns = event.payload;
    namespacesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ns.metadata.uid, ns);
      return newMap;
    });
  });
};

const getNamespacesPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Namespace[], string | null, string]>('get_namespaces_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Namespaces = () => {
  const nsState = useNamespacesState();
  listenNamespaceEvents();
  return (
    <PaginatedTable<Namespace>
      subscribeEvents={subscribeNamespacesEvents}
      getPage={getNamespacesPage}
      state={() => nsState.get() as Map<string, Namespace>}
      setState={nsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Namespaces;
