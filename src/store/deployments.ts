import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const deploymentsState = hookstate<{ deployments: Object[] }>({
  deployments: [],
});

export async function getDeployments(path: string, context: string, query: string) {
  try {
    let deployments = await invoke<any>('get_deployments', { path: path, context: context });
    deployments.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      deployments = deployments.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    console.log('found deployments', deployments);
    deploymentsState.deployments.set(deployments);
  } catch (error: any) {
    toast.error('Error! Cant load deployments\n' + error.message);
    console.log('Error! Cant load deployments\n' + error.message);
  }
}

export function useDeploymentsState() {
  return useHookstate(deploymentsState);
}
