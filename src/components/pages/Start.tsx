import { useEffect, useCallback } from 'react';
import { SearchField } from '~/components/SearchField';
import { useSearchState } from '@/store/search';
import { DataTable } from '@/components/ui/DataTable';
import columns from '@/components/pages/Start/Table/ColumnDef';
import { useConfigsState, getConfigs } from '@/store/kubeconfigs';

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
    <div className="flex flex-col flex-grow">
      <div className="flex items-center justify-between flex-shrink-0 h-12 border-b border-gray-300">
        <button className="relative focus:outline-none group">
          <SearchField />
        </button>
        <div className="flex items-center justify-between w-full h-12 px-2">
          <span className="hidden md:block text-muted-foreground text-xs font-bold"></span>
        </div>
        <div className="relative focus:outline-none group">
          <div className="flex items-center w-full h-12 px-4"></div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          <div className="h-24 col-span-2">
            <DataTable columns={columns} data={configs.configs.get()} />
          </div>
        </div>
      </div>
    </div>
  );
}
