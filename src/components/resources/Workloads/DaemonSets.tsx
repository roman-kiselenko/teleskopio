import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useDaemonSetsState, daemonSetsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/DaemonSets';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { DaemonSet } from 'kubernetes-models/apps/v1';

const subscribeDaemonSetEvents = async (rv: string) => {
  await invoke('daemonset_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenDaemonSetEvents = async () => {
  await listen<DaemonSet>('daemonset-deleted', (event) => {
    const ds = event.payload;
    daemonSetsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ds.metadata.uid);
      return newMap;
    });
  });

  await listen<DaemonSet>('daemonset-updated', (event) => {
    const ds = event.payload;
    daemonSetsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ds.metadata.uid, ds);
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
  return await invoke<[DaemonSet[], string | null, string]>('get_daemonsets_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const DaemonSets = () => {
  const dsState = useDaemonSetsState();
  listenDaemonSetEvents();
  return (
    <PaginatedTable<DaemonSet>
      subscribeEvents={subscribeDaemonSetEvents}
      getPage={getDaemonSetsPage}
      state={() => dsState.get() as Map<string, DaemonSet>}
      setState={dsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default DaemonSets;
