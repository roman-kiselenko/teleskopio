import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const serviceaccountsState = hookstate<{ serviceaccounts: Object[] }>({
  serviceaccounts: [],
});

export async function getServiceAccounts(path: string, context: string, query: string) {
  try {
    let serviceaccounts = await invoke<any>('get_serviceaccounts', {
      path: path,
      context: context,
    });
    serviceaccounts.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      serviceaccounts = serviceaccounts.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
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
