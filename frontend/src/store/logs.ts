import { hookstate, useHookstate } from '@hookstate/core';

export const logsState = hookstate<{ c: string; l: string }[]>([]);

export function useLogsState() {
  return useHookstate(logsState);
}
