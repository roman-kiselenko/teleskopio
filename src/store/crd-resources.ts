import { hookstate, useHookstate } from '@hookstate/core';

import { ApiResource } from '@/types';

export const crdResourcesState = hookstate<ApiResource[]>([]);

export function useCrdResourcesState() {
  return useHookstate(crdResourcesState);
}
