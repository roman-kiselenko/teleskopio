import { hookstate, useHookstate } from '@hookstate/core';

const loadingState = hookstate<Boolean>(false);

export function useloadingState() {
  return useHookstate(loadingState);
}

export function setLoading(value: Boolean) {
  loadingState.set(value);
}

export function getLoading() {
  loadingState.get();
}
