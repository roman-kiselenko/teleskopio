import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { Service } from '@/types';

export const servicesState = hookstate<Map<string, Service>>(new Map());

export async function getServices(path: string, context: string, query: string) {
  try {
    const services = await invoke<Service[]>('get_services', { path: path, context: context });
    console.log('found services', services);
    servicesState.set((prev) => {
      const newMap = new Map(prev);
      services.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load services\n' + error.message);
    console.log('Error! Cant load services\n' + error.message);
  }
}

export function useServicesState() {
  return useHookstate(servicesState);
}
