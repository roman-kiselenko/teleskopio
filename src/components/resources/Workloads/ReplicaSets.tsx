import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useReplicaSetsState, replicaSetsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/Deployments';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ReplicaSet } from 'kubernetes-models/apps/v1';

const subscribeReplicaSetEvents = async (rv: string) => {
  await invoke('replicaset_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenReplicaSetEvents = async () => {
  await listen<ReplicaSet>('replicaset-deleted', (event) => {
    const rs = event.payload;
    replicaSetsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(rs.metadata?.uid as string);
      return newMap;
    });
  });

  await listen<ReplicaSet>('replicaset-updated', (event) => {
    const rs = event.payload;
    replicaSetsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(rs.metadata?.uid as string, rs);
      return newMap;
    });
  });
};

const getReplicaSetsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[ReplicaSet[], string | null, string]>('get_replicasets_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const ReplicaSets = () => {
  const rsState = useReplicaSetsState();
  listenReplicaSetEvents();
  return (
    <PaginatedTable<ReplicaSet>
      subscribeEvents={subscribeReplicaSetEvents}
      getPage={getReplicaSetsPage}
      state={() => rsState.get() as Map<string, ReplicaSet>}
      setState={rsState.set}
      extractKey={(p) => p.metadata?.uid as string}
      columns={columns}
    />
  );
};

export default ReplicaSets;
