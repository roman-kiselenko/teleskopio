import { hookstate, useHookstate } from '@hookstate/core';
import { Pod } from '@/types';

export const podsState = hookstate<Map<string, Pod>>(new Map());

export function usePodsState() {
  return useHookstate(podsState);
}
