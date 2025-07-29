import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useStatefulSetsState, statefulSetsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/StatefulSets';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { StatefulSet } from '@/types';

const globalStatefulSetsState = async () => {
  try {
    await invoke('start_statefulset_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<StatefulSet[]>('statefulset-update', (event) => {
    const ss = event.payload;
    statefulSetsState.set(() => {
      const newMap = new Map();
      ss.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[StatefulSet[], string | null]>('get_statefulsets_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const StatefulSets = () => {
  const ssState = useStatefulSetsState();
  globalStatefulSetsState();
  return (
    <PaginatedTable<StatefulSet>
      getPage={getStatefulSetsPage}
      state={() => ssState.get() as Map<string, StatefulSet>}
      setState={ssState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default StatefulSets;
