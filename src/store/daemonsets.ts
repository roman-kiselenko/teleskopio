import { hookstate, useHookstate } from '@hookstate/core';
import { DaemonSet } from '@/types';

export const daemonSetsState = hookstate<Map<string, DaemonSet>>(new Map());

export function useDaemonSetsState() {
  return useHookstate(daemonSetsState);
}
