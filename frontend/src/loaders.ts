import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';
import { call } from '@/lib/api';
import { toast } from 'sonner';

export async function Load(kind: string, group: string, name: string, namespace: string) {
  const resource = apiResourcesState
    .get()
    .find((r: ApiResource) => r.kind === kind && r.group === group);
  if (!resource) throw new Error(`API resource for kind ${kind} not found`);
  let request = {
    name: name,
    ...resource,
  };
  if (resource.namespaced && namespace !== '') {
    request = { namespace: namespace, ...request } as any;
  }
  const response = await call('get_dynamic_resource', { request });
  if (response.message) {
    toast.error(`Error: ${response.message}`);
    return;
  }
  return response;
}

export async function LoadHelmRelease(name: string, namespace: string) {
  let request = {
    name: name,
    namespace: namespace,
  };
  const response = await call('helm_release', request);
  if (response.message) {
    toast.error(`Error: ${response.message}`);
    return;
  }
  return response;
}
