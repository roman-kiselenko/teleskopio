import { hookstate, useHookstate } from '@hookstate/core';

export const crdsState = hookstate<Map<string, any>>(new Map());

export function useCrdResourcesState() {
  return useHookstate(crdsState);
}
