import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useSecretsState, secretsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Configs/columns/Secrets';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Secret } from '@/types';

const globalSecretsState = async () => {
  try {
    await invoke('start_secret_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<Secret[]>('secret-update', (event) => {
    const ss = event.payload;
    secretsState.set(() => {
      const newMap = new Map();
      ss.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[Secret[], string | null]>('get_secrets_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Secrets = () => {
  const secretsState = useSecretsState();
  globalSecretsState();
  return (
    <PaginatedTable<Secret>
      getPage={getSecretsPage}
      state={() => secretsState.get() as Map<string, Secret>}
      setState={secretsState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Secrets;
