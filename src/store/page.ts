import { hookstate, useHookstate } from '@hookstate/core';

export const pageState = hookstate<{ currentPage: String }>({
  currentPage: 'pods',
});

export async function setPage(page: String) {
  pageState.currentPage.set(page);
}

export function usePageState() {
  return useHookstate(pageState);
}
