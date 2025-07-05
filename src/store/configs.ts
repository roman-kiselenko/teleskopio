import { hookstate, useHookstate } from '@hookstate/core'
import { invoke } from '@tauri-apps/api/core'
import toast from 'react-hot-toast';

interface KubeConfigFolder {
  configs: string[];
}

export const configsState = hookstate(async () => {
  let configs: KubeConfigFolder | undefined
  try {
    configs = await invoke<KubeConfigFolder>('lookup_configs')
    console.log("found configs", configs)
  } catch (error: any) {
    toast.error('Error! Cant find kube config\n' + error.message)
    console.log("cant lookup kube config directory "+ error.message)
  }
  return {
    configs: configs
  }
})

export function getConfigFolder() {
  return configsState.configs.get()
}
export function useConfigsState() {
  return useHookstate(configsState)
}