import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';
import { call } from '@/lib/api';

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
  return await call('get_dynamic_resource', { request });
}
