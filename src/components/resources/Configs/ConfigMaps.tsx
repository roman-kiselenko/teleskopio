import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useConfigmapsState, configmapsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Configs/columns/ConfigMaps';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ConfigMap } from '@/types';

const globalConfigmapsState = async () => {
  try {
    await invoke('start_configmap_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<ConfigMap[]>('configmap-update', (event) => {
    const cm = event.payload;
    configmapsState.set(() => {
      const newMap = new Map();
      cm.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[ConfigMap[], string | null]>('get_configmaps_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const ConfigMaps = () => {
  const configmapsState = useConfigmapsState();
  globalConfigmapsState();
  return (
    <PaginatedTable<ConfigMap>
      getPage={getConfigmapsPage}
      state={() => configmapsState.get() as Map<string, ConfigMap>}
      setState={configmapsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default ConfigMaps;
