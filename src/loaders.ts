import { invoke } from '@tauri-apps/api/core';
import { currentClusterState } from '@/store/cluster';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/api-resources';

export async function Load(kind: string, name: string, namespace: string) {
  const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === kind);
  if (!resource) throw new Error(`API resource for kind ${kind} not found`);
  let request = {
    name: name,
    ...resource,
  };
  if (resource.namespaced && namespace !== '') {
    request = { namespace: namespace, ...request } as any;
  }
  return invoke<any>('get_dynamic_resource', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    request,
  });
}
