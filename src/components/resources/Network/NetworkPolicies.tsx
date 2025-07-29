import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useNetworkPoliciesState, networkpoliciesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Network/columns/NetworkPolicies';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { NetworkPolicy } from '@/types';

const globalNetworkPoliciesState = async () => {
  try {
    await invoke('start_networkpolicy_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<NetworkPolicy[]>('networkpolicy-update', (event) => {
    const np = event.payload;
    networkpoliciesState.set(() => {
      const newMap = new Map();
      np.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[NetworkPolicy[], string | null]>('get_networkpolicies_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const NetworkPolicies = () => {
  const npState = useNetworkPoliciesState();
  globalNetworkPoliciesState();
  return (
    <PaginatedTable<NetworkPolicy>
      getPage={getNetworkPoliciesPage}
      state={() => npState.get() as Map<string, NetworkPolicy>}
      setState={npState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default NetworkPolicies;
