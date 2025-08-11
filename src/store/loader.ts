import { hookstate, useHookstate } from '@hookstate/core';

const loadingState = hookstate<Boolean>(false);

export function useloadingStateState() {
  return useHookstate(loadingState);
}

export function setLoading(value: Boolean) {
  loadingState.set(value);
}

export function getLoading() {
  loadingState.get();
}
