import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useSecretsState, secretsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Configs/columns/Secrets';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Secret } from 'kubernetes-models/v1';

const subscribeSecretsEvents = async (rv: string) => {
  await invoke('secret_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenReplicaSetEvents = async () => {
  await listen<Secret>('secret-deleted', (event) => {
    const rs = event.payload;
    secretsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(rs.metadata.uid);
      return newMap;
    });
  });

  await listen<Secret>('secret-updated', (event) => {
    const ss = event.payload;
    secretsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ss.metadata.uid, ss);
      return newMap;
    });
  });
};

const getSecretsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Secret[], string | null, string]>('get_secrets_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Secrets = () => {
  const secretsState = useSecretsState();
  listenReplicaSetEvents();
  return (
    <PaginatedTable<Secret>
      subscribeEvents={subscribeSecretsEvents}
      getPage={getSecretsPage}
      state={() => secretsState.get() as Map<string, Secret>}
      setState={secretsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Secrets;
