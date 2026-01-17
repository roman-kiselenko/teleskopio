import { useEffect, useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useloadingState } from '@/store/loader';
import { DataTable } from '@/components/ui/DataTable';
import columns from '@/components/pages/Helm/Table/ColumnDef';
import { useHelmState, getCharts } from '@/store/helm';
import { useNamespacesState } from '@/store/resources';
import { call } from '@/lib/api';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { useSelectedNamespacesState } from '@/store/selectedNamespace';
import { useWS } from '@/context/WsContext';
import { addSubscription } from '@/lib/subscriptionManager';
import { currentClusterState } from '@/store/cluster';

export function HelmPage() {
  const selectedNamespace = useSelectedNamespacesState();
  const namespaces = useNamespacesState();
  const namespacesArray = Array.from(
    namespaces
      .get()
      .values()
      .map((n: any) => n.metadata.name),
  );
  const helmCharts = useHelmState();
  const [searchQuery, setSearchQuery] = useState('');
  const loading = useloadingState();
  const { listen } = useWS();

  const listenEvents = async () => {
    const server = currentClusterState.server.get();
    addSubscription(
      await listen(`helm-release-${server}-added`, (payload: any) => {
        helmCharts.set((prev) => {
          const newMap = new Map(prev);
          newMap.set(`${payload.namespace}-${payload.name}` as string, payload);
          return newMap;
        });
      }),
    );

    addSubscription(
      await listen(`helm-release-${server}-deleted`, (payload: any) => {
        helmCharts.set((prev) => {
          const newMap = new Map(prev);
          newMap.delete(`${payload.namespace}-${payload.name}` as string);
          return newMap;
        });
      }),
    );

    addSubscription(
      await listen(`helm-release-${server}-updated`, (payload: any) => {
        helmCharts.set((prev) => {
          const newMap = new Map(prev);
          newMap.set(`${payload.namespace}-${payload.name}` as string, payload);
          return newMap;
        });
      }),
    );
  };

  const fetchData = useCallback(async () => {
    try {
      await call<any[]>('ping');
      await getCharts(searchQuery, namespacesArray, selectedNamespace.get());
    } catch (error: any) {
      toast.error('Error! Cant ping server\n' + error.message);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
    listenEvents();
  }, [fetchData, selectedNamespace]);

  return (
    <div className="flex-grow overflow-auto">
      {<Header setSearchQuery={setSearchQuery} withNsSelector={true} />}

      <div className="grid grid-cols-1">
        <div className="h-24 col-span-2">
          {loading.get() && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          )}
          <DataTable
            menuDisabled={true}
            kind={'helm'}
            noResult={true}
            columns={columns as any}
            data={Array.from(helmCharts.get().values())}
          />
        </div>
      </div>
    </div>
  );
}
