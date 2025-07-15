import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const networkpoliciesState = hookstate<{ networkpolicies: Object[] }>({
  networkpolicies: [],
});

export async function getNetworkPolicies(path: string, context: string) {
  try {
    const networkpolicies = await invoke<any>('get_networkpolicies', {
      path: path,
      context: context,
    });
    console.log('found networkpolicies', networkpolicies);
    networkpoliciesState.networkpolicies.set(networkpolicies);
  } catch (error: any) {
    toast.error('Error! Cant load networkpolicies\n' + error.message);
    console.log('Error! Cant load networkpolicies\n' + error.message);
  }
}

export function useNetworkPoliciesState() {
  return useHookstate(networkpoliciesState);
}
