import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useDaemonSetsState, daemonSetsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/DaemonSets';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { DaemonSet } from '@/types';

const globalDaemonSetState = async () => {
  try {
    await invoke('start_daemonset_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<DaemonSet[]>('daemonset-update', (event) => {
    const ds = event.payload;
    daemonSetsState.set(() => {
      const newMap = new Map();
      ds.forEach((p) => newMap.set(p.metadata.uid, p));
      return newMap;
    });
  });
};

const getDaemonSetsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[DaemonSet[], string | null]>('get_daemonsets_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const DaemonSets = () => {
  const dsState = useDaemonSetsState();
  globalDaemonSetState();
  return (
    <PaginatedTable<DaemonSet>
      getPage={getDaemonSetsPage}
      state={() => dsState.get() as Map<string, DaemonSet>}
      setState={dsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default DaemonSets;
