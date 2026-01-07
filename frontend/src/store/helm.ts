import { hookstate, useHookstate } from '@hookstate/core';
import { toast } from 'sonner';
import { call } from '@/lib/api';

export const helmState = hookstate<{ charts: object[] }>({
  charts: [],
});

export async function getCharts(query: string) {
  try {
    let { charts } = await call<any[]>('helm_charts', {});
    if (query !== '') {
      charts = charts.filter((c) => {
        return String(c.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
    helmState.charts.set(charts);
  } catch (error: any) {
    toast.error('Error! Cant load helm charts\n' + error.message);
    console.error('Error! Cant load helm charts\n' + error.message);
  }
}

export function useHelmState() {
  return useHookstate(helmState);
}
