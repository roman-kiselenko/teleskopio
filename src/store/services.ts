import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const servicesState = hookstate<{ services: Object[] }>({
  services: [],
});

export async function getServices(path: string, context: string) {
  try {
    const services = await invoke<any>('get_services', { path: path, context: context });
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
