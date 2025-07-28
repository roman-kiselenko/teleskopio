import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { ServiceAccount } from '@/types';

export const serviceaccountsState = hookstate<Map<string, ServiceAccount>>(new Map());

export async function getServiceAccounts(path: string, context: string, query: string) {
  try {
    const serviceaccounts = await invoke<ServiceAccount[]>('get_serviceaccounts', {
      path: path,
      context: context,
    });
    console.log('found serviceaccounts', serviceaccounts);
    serviceaccountsState.set((prev) => {
      const newMap = new Map(prev);
      serviceaccounts.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load serviceaccounts\n' + error.message);
    console.log('Error! Cant load serviceaccounts\n' + error.message);
  }
}

export function useServiceAccountsState() {
  return useHookstate(serviceaccountsState);
}
