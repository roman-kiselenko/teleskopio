// import { invoke } from '@tauri-apps/api/core';
import { currentClusterState } from '@/store/cluster';
import { toast } from 'sonner';
import yaml from 'js-yaml';

type InvokePayload = Record<string, unknown>;

export async function call<T = any>(action: string, payload?: InvokePayload): Promise<T | any> {
  let request = { ...payload };
  console.log(currentClusterState);
  if (currentClusterState.server.get() !== '' && currentClusterState.context.get() !== '') {
    request.server = currentClusterState.server.get();
    request.context = currentClusterState.context.get();
  }
  if (payload) {
    console.log(`[${action}] hit payload [${JSON.stringify(request)}]`);
    const res = await fetch(`/api/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return res.json();
    }
    if (contentType.includes('application/yaml') || contentType.includes('text/yaml')) {
      return res.text();
    }
    return res.text();
  }
  console.log(`[${action}] hit`);
  const res = await fetch(`/api/${action}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

// export async function call<T = any>(action: string, payload?: InvokePayload): Promise<T> {
//   let request = { ...payload };
//   if (currentClusterState.kube_config.get() !== '' && currentClusterState.context.get() !== '') {
//     request.path = currentClusterState.kube_config.get();
//     request.context = currentClusterState.context.get();
//   }
//   try {
//     console.debug(`[Backend] invoke ${action} ${JSON.stringify(request)}`);
//     return await invoke<T>(action, request);
//   } catch (error: any) {
//     console.error(`[Backend API Error] "${action}" ${JSON.stringify(request)} failed:`, error);
//     if (error.message) {
//       toast.error(`API Response ${error.message}`);
//     }
//     throw error;
//   }
// }
