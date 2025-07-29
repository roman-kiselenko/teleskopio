import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useNamespacesState, namespacesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Configs/columns/Namespaces';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Namespace } from '@/types';

const globalNamespacesState = async () => {
  try {
    await invoke('start_namespace_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<Namespace[]>('namespace-update', (event) => {
    const ns = event.payload;
    namespacesState.set(() => {
      const newMap = new Map();
      ns.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[Namespace[], string | null]>('get_namespaces_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Namespaces = () => {
  const nsState = useNamespacesState();
  globalNamespacesState();
  return (
    <PaginatedTable<Namespace>
      getPage={getNamespacesPage}
      state={() => nsState.get() as Map<string, Namespace>}
      setState={nsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Namespaces;
