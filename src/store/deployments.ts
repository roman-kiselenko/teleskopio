import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const deploymentsState = hookstate<{ deployments: Object[] }>({
  deployments: [],
});

export async function getDeployments(path: string, context: string) {
  try {
    const deployments = await invoke<any>('get_deployments', { path: path, context: context });
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
