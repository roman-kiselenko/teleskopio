import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const servicesState = hookstate<{ services: Object[] }>({
  services: [],
});

export async function getServices(path: string, context: string, query: string) {
  try {
    let services = await invoke<any>('get_services', { path: path, context: context });
    services.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      services = services.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    console.log('found services', services);
    servicesState.services.set(services);
  } catch (error: any) {
    toast.error('Error! Cant load services\n' + error.message);
    console.log('Error! Cant load services\n' + error.message);
  }
}

export function useServicesState() {
  return useHookstate(servicesState);
}
