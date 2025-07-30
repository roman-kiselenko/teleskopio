import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useServiceAccountsState, serviceaccountsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Access/columns/ServiceAccounts';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ServiceAccount } from '@/types';

const subscribeServiceAccountsEvents = async (rv: string) => {
  await invoke('serviceaccount_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenServiceAccountsEvents = async () => {
  await listen<ServiceAccount>('serviceaccount-updated', (event) => {
    const sa = event.payload;
    serviceaccountsState.set(() => {
      const newMap = new Map();
      newMap.set(sa.metadata.uid, sa);
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
  return await invoke<[ServiceAccount[], string | null, string]>('get_serviceaccounts_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const ServiceAccounts = () => {
  const saState = useServiceAccountsState();
  listenServiceAccountsEvents();
  return (
    <PaginatedTable<ServiceAccount>
      subscribeEvents={subscribeServiceAccountsEvents}
      getPage={getServiceAccountsPage}
      state={() => saState.get() as Map<string, ServiceAccount>}
      setState={saState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default ServiceAccounts;
