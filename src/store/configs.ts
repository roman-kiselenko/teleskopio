import { hookstate, useHookstate, Immutable } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';

type KubeConfigs = {
  configs: Object[];
};

export const configsState = hookstate(async () => {
  let configs: KubeConfigs = { configs: [] };
  try {
    configs.configs = await invoke<Object[]>('lookup_configs');
  } catch (error: any) {
    toast.error('Error! Cant find kube config\n' + error.message);
    console.log('cant lookup kube config directory ' + error.message);
  }
  const value = { configs: configs };
  return value;
});

export function getConfigFolder() {
  return configsState.configs.get().configs.slice();
}
export function useConfigsState() {
  return useHookstate(configsState);
}
