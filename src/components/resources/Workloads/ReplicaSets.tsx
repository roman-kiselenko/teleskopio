import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useReplicaSetsState, replicaSetsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/Deployments';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ReplicaSet } from '@/types';

const globalReplicaSetsState = async () => {
  try {
    await invoke('start_replicaset_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<ReplicaSet[]>('replicaset-update', (event) => {
    const rs = event.payload;
    replicaSetsState.set(() => {
      const newMap = new Map();
      rs.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[ReplicaSet[], string | null]>('get_replicasets_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const ReplicaSets = () => {
  const rsState = useReplicaSetsState();
  globalReplicaSetsState();
  return (
    <PaginatedTable<ReplicaSet>
      getPage={getReplicaSetsPage}
      state={() => rsState.get() as Map<string, ReplicaSet>}
      setState={rsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default ReplicaSets;
