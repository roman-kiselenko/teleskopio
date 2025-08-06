import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useDeploymentsState, deploymentsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/Deployments';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Deployment } from 'kubernetes-models/apps/v1';

const subscribeDeploymentEvents = async (rv: string) => {
  await invoke('deployment_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenDeploymentEvents = async () => {
  await listen<Deployment>('deployment-deleted', (event) => {
    const dp = event.payload;
    deploymentsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(dp.metadata?.uid as string);
      return newMap;
    });
  });

  await listen<Deployment>('deployment-updated', (event) => {
    const dp = event.payload;
    deploymentsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(dp.metadata?.uid as string, dp);
      return newMap;
    });
  });
};

const getDeploymentsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Deployment[], string | null, string]>('get_deployments_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Deployments = () => {
  const dpState = useDeploymentsState();
  listenDeploymentEvents();
  return (
    <PaginatedTable<Deployment>
      getPage={getDeploymentsPage}
      subscribeEvents={subscribeDeploymentEvents}
      state={() => dpState.get() as Map<string, Deployment>}
      setState={dpState.set}
      extractKey={(p) => p.metadata?.uid as string}
      columns={columns}
    />
  );
};

export default Deployments;
