import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useNetworkPoliciesState, networkpoliciesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Network/columns/NetworkPolicies';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { NetworkPolicy } from '@/types';

const subscribeNetworkPoliciesEvents = async (rv: string) => {
  await invoke('networkpolicy_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenNetworkPoliciesEvents = async () => {
  await listen<NetworkPolicy>('networkpolicy-deleted', (event) => {
    const np = event.payload;
    networkpoliciesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(np.metadata.uid);
      return newMap;
    });
  });

  await listen<NetworkPolicy>('networkpolicy-updated', (event) => {
    const np = event.payload;
    networkpoliciesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(np.metadata.uid, np);
      return newMap;
    });
  });
};

const getNetworkPoliciesPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[NetworkPolicy[], string | null, string]>('get_networkpolicies_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const NetworkPolicies = () => {
  const npState = useNetworkPoliciesState();
  listenNetworkPoliciesEvents();
  return (
    <PaginatedTable<NetworkPolicy>
      subscribeEvents={subscribeNetworkPoliciesEvents}
      getPage={getNetworkPoliciesPage}
      state={() => npState.get() as Map<string, NetworkPolicy>}
      setState={npState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default NetworkPolicies;
