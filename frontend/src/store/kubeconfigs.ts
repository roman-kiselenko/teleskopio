import { hookstate, useHookstate } from '@hookstate/core';
import { toast } from 'sonner';
import { call } from '@/lib/api';

export const kubeConfigsState = hookstate<{ configs: object[] }>({
  configs: [],
});

export async function getConfigs(query: string) {
  try {
    let configs = await call<any[]>('lookup_configs');
    if (query !== '') {
      configs = configs.filter((c) => {
        return String(c.server || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    kubeConfigsState.configs.set(configs);
  } catch (error: any) {
    toast.error('Error! Cant load configs\n' + error.message);
    console.error('Error! Cant load configs\n' + error.message);
  }
}

export function useConfigsState() {
  return useHookstate(kubeConfigsState);
}
