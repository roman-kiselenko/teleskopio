import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { NetworkPolicy } from '@/types';

export const networkpoliciesState = hookstate<Map<string, NetworkPolicy>>(new Map());

export async function getNetworkPolicies(path: string, context: string, query: string) {
  try {
    const networkpolicies = await invoke<NetworkPolicy[]>('get_networkpolicies', {
      path: path,
      context: context,
    });
    console.log('found networkpolicies', networkpolicies);
    networkpoliciesState.set((prev) => {
      const newMap = new Map(prev);
      networkpolicies.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load networkpolicies\n' + error.message);
    console.log('Error! Cant load networkpolicies\n' + error.message);
  }
}

export function useNetworkPoliciesState() {
  return useHookstate(networkpoliciesState);
}
