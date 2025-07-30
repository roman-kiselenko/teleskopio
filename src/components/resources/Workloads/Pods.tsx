import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { usePodsState, podsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/Pods/Pods';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Pod } from '@/types';

const subscribePodEvents = async (rv: string) => {
  await invoke('pod_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenPodEvents = async () => {
  await listen<Pod>('pod-deleted', (event) => {
    const pod = event.payload;
    podsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(pod.uid);
      return newMap;
    });
  });

  await listen<Pod>('pod-updated', (event) => {
    const pod = event.payload;
    podsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(pod.uid, pod);
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
  return await invoke<[Pod[], string | null, string]>('get_pods_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Pods = () => {
  const podsState = usePodsState();
  listenPodEvents();
  return (
    <PaginatedTable<Pod>
      getPage={getPodsPage}
      subscribeEvents={subscribePodEvents}
      state={() => podsState.get() as Map<string, Pod>}
      setState={podsState.set}
      extractKey={(p) => p.uid}
      columns={columns}
    />
  );
};

export default Pods;
