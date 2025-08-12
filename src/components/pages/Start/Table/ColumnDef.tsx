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
import { apiResourcesState } from '@/store/api-resources';
import { useCrdsState } from '@/store/crd-resources';
import { useloadingStateState } from '@/store/loader';
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
      const crdResources = useCrdsState();
      const loading = useloadingStateState();
      const get_version = async (context: string, path: any) => {
        loading.set(true);
        const clusterVersion = await call('get_version', { context: context, path: path });
        setVersion(clusterVersion.gitVersion);
        setCurrentCluster(context, path);
        toast.info(<div>Cluster version: {clusterVersion.gitVersion}</div>);
        apiResourcesState.set(await call('list_apiresources', {}));
        toast.info(<div>API Resources loaded: {apiResourcesState.get().length}</div>);
        const [resources, rv] = await call('list_crd_resources', {});
        if (resources.length > 0) {
          toast.info(<div>CRD Resources loaded: {resources.length}</div>);
        }
        const resource = apiResourcesState
          .get()
          .find((r: ApiResource) => r.kind === 'CustomResourceDefinition');
        await call('watch_dynamic_resource', {
          request: {
            ...resource,
            resource_version: rv,
          },
        });
        await addSubscription(
          listenEvent(`CustomResourceDefinition-${context}-deleted`, async (ev: any) => {
            crdResources.set((prev) => {
              const newMap = new Map(prev);
              newMap.delete(ev.metadata?.uid as string);
              return newMap;
            });
            apiResourcesState.set(await call('list_apiresources', {}));
          }),
        );
        await addSubscription(
          listenEvent(`CustomResourceDefinition-${context}-updated`, async (ev: any) => {
            crdResources.set((prev) => {
              const newMap = new Map(prev);
              newMap.set(ev.metadata?.uid as string, ev);
              return newMap;
            });
            apiResourcesState.set(await call('list_apiresources', {}));
          }),
        );
        resources.forEach((x) => {
          crdResources.set((prev) => {
            const newMap = new Map(prev);
            newMap.set(x.metadata?.uid as string, x);
            return newMap;
          });
        });
        loading.set(false);
        navigate('/cluster');
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
              await get_version(row.original.current_context as string, row.original.path);
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
