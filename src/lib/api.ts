import { invoke } from '@tauri-apps/api/core';
import { currentClusterState } from '@/store/cluster';
import { toast } from 'sonner';

type InvokePayload = Record<string, unknown>;

export async function call<T = any>(action: string, payload?: InvokePayload): Promise<T> {
  let request = { ...payload };
  if (currentClusterState.kube_config.get() !== '' && currentClusterState.context.get() !== '') {
    request.path = currentClusterState.kube_config.get();
    request.context = currentClusterState.context.get();
  }
  try {
    console.debug(`[Tauri] invoke ${action} ${JSON.stringify(request)}`);
    return await invoke<T>(action, request);
  } catch (error: any) {
    console.error(`[Tauri API Error] "${action}" ${JSON.stringify(request)} failed:`, error);
    if (error.message) {
      toast.error(`API Response ${error.message}`);
    }
    throw error;
  }
}
