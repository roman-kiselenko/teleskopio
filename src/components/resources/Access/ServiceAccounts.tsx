import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useServiceAccountsState, serviceaccountsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Access/columns/ServiceAccounts';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ServiceAccount } from '@/types';

const globalServiceAccountsState = async () => {
  try {
    await invoke('start_serviceaccount_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<ServiceAccount[]>('serviceaccount-update', (event) => {
    const sa = event.payload;
    serviceaccountsState.set(() => {
      const newMap = new Map();
      sa.forEach((p) => newMap.set(p.metadata.uid, p));
      return newMap;
    });
  });
};

const getServiceAccountsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[ServiceAccount[], string | null]>('get_serviceaccounts_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const ServiceAccounts = () => {
  const saState = useServiceAccountsState();
  globalServiceAccountsState();
  return (
    <PaginatedTable<ServiceAccount>
      getPage={getServiceAccountsPage}
      state={() => saState.get() as Map<string, ServiceAccount>}
      setState={saState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default ServiceAccounts;
