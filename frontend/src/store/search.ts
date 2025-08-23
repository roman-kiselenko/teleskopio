import { hookstate, useHookstate } from '@hookstate/core';

const searchState = hookstate<{
  q: string;
}>({
  q: '',
});

export function useSearchState() {
  return useHookstate(searchState);
}

export function setSearchQuery(q: string) {
  searchState.q.set(q);
}
