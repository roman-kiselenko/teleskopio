import { hookstate, useHookstate } from '@hookstate/core';

import { ApiResource } from '@/types';

export const apiResourcesState = hookstate<ApiResource[]>([]);

export function useApiResourcesState() {
  return useHookstate(apiResourcesState);
}
