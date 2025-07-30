import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useIngressesState, ingressesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Network/columns/Ingresses';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Ingress } from '@/types';

const subscribeIngressesEvents = async (rv: string) => {
  await invoke('ingress_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenIngressEvents = async () => {
  await listen<Ingress>('ingress-deleted', (event) => {
    const ing = event.payload;
    ingressesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ing.metadata.uid);
      return newMap;
    });
  });

  await listen<Ingress>('ingress-updated', (event) => {
    const ing = event.payload;
    ingressesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ing.metadata.uid, ing);
      return newMap;
    });
  });
};

const getIngressesPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Ingress[], string | null, string]>('get_ingresses_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Ingresses = () => {
  const ingState = useIngressesState();
  listenIngressEvents();
  return (
    <PaginatedTable<Ingress>
      getPage={getIngressesPage}
      subscribeEvents={subscribeIngressesEvents}
      state={() => ingState.get() as Map<string, Ingress>}
      setState={ingState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Ingresses;
