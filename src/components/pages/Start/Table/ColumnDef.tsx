import { Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Cluster } from '@/types';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { call } from '@/lib/api';
import { listenEvent } from '@/lib/events';
import { setVersion } from '@/store/version';
import { setCurrentCluster } from '@/store/cluster';
import { apiResourcesState } from '@/store/apiResources';
import { namespacesState } from '@/store/resources';
import { crdsState } from '@/store/crdResources';
import { crsState } from '@/store/resources';
import { useloadingState } from '@/store/loader';
import type { ApiResource } from '@/types';
import { addSubscription } from '@/lib/subscriptionManager';

const columns: ColumnDef<Cluster>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    meta: { className: 'max-w-[35ch] truncate' },
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <div>{row.original.name}</div>),
  },
  {
    accessorKey: 'server',
    id: 'server',
    header: 'Server',
    cell: ({ row }) => {
      return <div>{row.original.server}</div>;
    },
  },
  {
    accessorKey: 'connect',
    id: 'connect',
    header: '',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const loading = useloadingState();
      const get_version = async (context: string, path: any) => {
        const clusterVersion = await call('get_version', { context: context, path: path });
        setVersion(clusterVersion.gitVersion);
        setCurrentCluster(context, path);
        toast.info(<div>Cluster version: {clusterVersion.gitVersion}</div>);
        apiResourcesState.set(await call('list_apiresources', {}));
        toast.info(<div>API Resources loaded: {apiResourcesState.get().length}</div>);
        fetchAndWatchNamespaces(context);
      };
      return (
        <Button
          className="text-xs"
          variant="outline"
          size="sm"
          onClick={async () => {
            if (row.original?.current_context === '') {
              toast.error('There is no current context in config');
            } else {
              try {
                loading.set(true);
                await get_version(row.original.current_context as string, row.original.path);
                loading.set(false);
                navigate('/resource/Node');
              } catch (error: any) {
                if (error.message) {
                  toast.error(`Cant connect to cluster: ${error.message}`);
                }
              } finally {
                loading.set(false);
              }
            }
          }}
        >
          <Unplug className="h-2 w-2" />
          Connect
        </Button>
      );
    },
  },
];

export default columns;

async function fetchAndWatchNamespaces(context: string): Promise<void> {
  const nsResource = apiResourcesState
    .get()
    .find((r: ApiResource) => r.kind === 'Namespace' && r.group === '');
  const [ns] = await call('list_dynamic_resource', { request: { ...nsResource } });
  ns.forEach((x) => {
    namespacesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(x.metadata?.uid as string, x);
      return newMap;
    });
  });
  await addSubscription(
    listenEvent(`Namespace-${context}-deleted`, async (ev: any) => {
      namespacesState.set((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ev.metadata?.uid as string);
        return newMap;
      });
    }),
  );
  await addSubscription(
    listenEvent(`Namespace-${context}-updated`, async (ev: any) => {
      namespacesState.set((prev) => {
        const newMap = new Map(prev);
        newMap.set(ev.metadata?.uid as string, ev);
        return newMap;
      });
    }),
  );
}
