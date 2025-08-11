import { useState, useEffect, useCallback } from 'react';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import columns from '@/components/pages/Start/Table/ColumnDef';
import { useConfigsState, getConfigs } from '@/store/kubeconfigs';
import { Input } from '@/components/ui/input';

export function StartPage() {
  const configs = useConfigsState();
  const searchQuery = useSearchState();
  const query = searchQuery.q.get();

  const fetchData = useCallback(async () => {
    await getConfigs(query);
  }, [query]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex-grow overflow-auto">
      <div className="flex flex-row pt-3 px-2 items-center justify-between">
        <Input
          placeholder="Filter by name..."
          className="focus:ring-0 focus:outline-none bg-transparent"
          onChange={(e) => searchQuery.q.set(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1">
        <div className="h-24 col-span-2">
          <DataTable noResult={true} columns={columns as any} data={configs.configs.get() as any} />
        </div>
      </div>
    </div>
  );
}
