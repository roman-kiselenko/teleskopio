import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useStatefulSetsState, statefulSetsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/StatefulSets';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { StatefulSet } from '@/types';

const subscribeStatefulSetEvents = async (rv: string) => {
  await invoke('statefulset_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenStatefulSetEvents = async () => {
  await listen<StatefulSet>('replicaset-deleted', (event) => {
    const ss = event.payload;
    statefulSetsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ss.metadata.uid);
      return newMap;
    });
  });

  await listen<StatefulSet>('statefulset-updated', (event) => {
    const ss = event.payload;
    statefulSetsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ss.metadata.uid, ss);
      return newMap;
    });
  });
};

const getStatefulSetsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[StatefulSet[], string | null, string]>('get_statefulsets_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const StatefulSets = () => {
  const ssState = useStatefulSetsState();
  listenStatefulSetEvents();
  return (
    <PaginatedTable<StatefulSet>
      subscribeEvents={subscribeStatefulSetEvents}
      getPage={getStatefulSetsPage}
      state={() => ssState.get() as Map<string, StatefulSet>}
      setState={ssState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default StatefulSets;
