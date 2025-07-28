import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { Deployment } from '@/types';

export const deploymentState = hookstate<Map<string, Deployment>>(new Map());

export async function getDeployments(path: string, context: string, query: string) {
  try {
    const deployments = await invoke<Deployment[]>('get_deployments', {
      path: path,
      context: context,
    });
    console.log('found deployments', deployments);
    deploymentState.set((prev) => {
      const newMap = new Map(prev);
      deployments.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load deployments\n' + error.message);
    console.log('Error! Cant load deployments\n' + error.message);
  }
}
export function useDeploymentState() {
  return useHookstate(deploymentState);
}
