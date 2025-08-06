import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useConfigmapsState, configmapsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Configs/columns/ConfigMaps';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ConfigMap } from 'kubernetes-models/v1';

const subscribeConfigmapsEvents = async (rv: string) => {
  await invoke('configmap_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenConfigMapsEvents = async () => {
  await listen<ConfigMap>('configmap-deleted', (event) => {
    const cm = event.payload;
    configmapsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cm.metadata?.uid as string);
      return newMap;
    });
  });

  await listen<ConfigMap>('configmap-updated', (event) => {
    const cm = event.payload;
    configmapsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(cm.metadata?.uid as string, cm);
      return newMap;
    });
  });
};

const getConfigmapsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[ConfigMap[], string | null, string]>('get_configmaps_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const ConfigMaps = () => {
  const configmapsState = useConfigmapsState();
  listenConfigMapsEvents();
  return (
    <PaginatedTable<ConfigMap>
      subscribeEvents={subscribeConfigmapsEvents}
      getPage={getConfigmapsPage}
      state={() => configmapsState.get() as Map<string, ConfigMap>}
      setState={configmapsState.set}
      extractKey={(p) => p.metadata?.uid as string}
      columns={columns}
    />
  );
};

export default ConfigMaps;
