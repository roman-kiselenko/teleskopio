import { hookstate, useHookstate } from '@hookstate/core';

const loadingState = hookstate<boolean>(false);

export function useloadingState() {
  return useHookstate(loadingState);
}

export function setLoading(value: boolean) {
  loadingState.set(value);
}

export function getLoading() {
  loadingState.get();
}
