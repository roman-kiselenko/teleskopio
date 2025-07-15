import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const serviceaccountsState = hookstate<{ serviceaccounts: Object[] }>({
  serviceaccounts: [],
});

export async function getServiceAccounts(path: string, context: string) {
  try {
    const serviceaccounts = await invoke<any>('get_serviceaccounts', {
      path: path,
      context: context,
    });
    console.log('found serviceaccounts', serviceaccounts);
    serviceaccountsState.serviceaccounts.set(serviceaccounts);
  } catch (error: any) {
    toast.error('Error! Cant load serviceaccounts\n' + error.message);
    console.log('Error! Cant load serviceaccounts\n' + error.message);
  }
}

export function useServiceAccountsState() {
  return useHookstate(serviceaccountsState);
}
