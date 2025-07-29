import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { usePodsState, podsState } from '@/store/pods';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/Pods/Pods';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Pod } from '@/types';

const globalPodState = async () => {
  try {
    await invoke('start_pod_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<Pod[]>('pods-update', (event) => {
    const pods = event.payload;
    if (pods.length === 0) return;
    podsState.set(() => {
      const newMap = new Map();
      pods.forEach((p) => newMap.set(p.uid, p));
      return newMap;
    });
  });
};

const getPodsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Pod[], string | null]>('get_pods_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Pods = () => {
  const podsState = usePodsState();
  globalPodState();
  return (
    <PaginatedTable<Pod>
      getPage={getPodsPage}
      state={() => podsState.get() as Map<string, Pod>}
      setState={podsState.set}
      extractKey={(p) => p.uid}
      columns={columns}
    />
  );
};

export default Pods;
