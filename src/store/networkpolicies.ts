import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const networkpoliciesState = hookstate<{ networkpolicies: Object[] }>({
  networkpolicies: [],
});

export async function getNetworkPolicies(path: string, context: string, query: string) {
  try {
    let networkpolicies = await invoke<any>('get_networkpolicies', {
      path: path,
      context: context,
    });
    networkpolicies.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      networkpolicies = networkpolicies.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
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
