import { hookstate, useHookstate } from '@hookstate/core';

export const resourceEventsState = hookstate<[]>([]);

export function useResourceEventsState() {
  return useHookstate(resourceEventsState);
}
