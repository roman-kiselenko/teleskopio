import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useIngressesState, ingressesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Network/columns/Ingresses';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Ingress } from '@/types';

const globalIngressesState = async () => {
  try {
    await invoke('start_ingress_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<Ingress[]>('ingress-update', (event) => {
    const ing = event.payload;
    ingressesState.set(() => {
      const newMap = new Map();
      ing.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[Ingress[], string | null]>('get_ingresses_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Ingresses = () => {
  const ingState = useIngressesState();
  globalIngressesState();
  return (
    <PaginatedTable<Ingress>
      getPage={getIngressesPage}
      state={() => ingState.get() as Map<string, Ingress>}
      setState={ingState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Ingresses;
