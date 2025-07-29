import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useDeploymentsState, deploymentsState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Workloads/columns/Deployments';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Deployment } from '@/types';

const globalDeploymentsState = async () => {
  try {
    await invoke('start_deployment_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<Deployment[]>('deployment-update', (event) => {
    const dp = event.payload;
    deploymentsState.set(() => {
      const newMap = new Map();
      dp.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[Deployment[], string | null]>('get_deployments_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Deployments = () => {
  const dpState = useDeploymentsState();
  globalDeploymentsState();
  return (
    <PaginatedTable<Deployment>
      getPage={getDeploymentsPage}
      state={() => dpState.get() as Map<string, Deployment>}
      setState={dpState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Deployments;
