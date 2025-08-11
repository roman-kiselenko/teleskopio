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
import type { ApiResource } from '@/types';

const columns: ColumnDef<Cluster>[] = [
  {
    accessorKey: 'name',
    id: 'name',
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
      const get_version = async (context: string, path: any) => {
        toast.promise(call('get_version', { context: context, path: path }), {
          loading: 'Connecting...',
          success: async (data: { gitVersion: string }) => {
            setVersion(data.gitVersion);
            setCurrentCluster(context, path);
            // The logic below is about CRD section
            // we must watch CRDs and update api resources
            apiResourcesState.set(await call('list_apiresources', {}));
            const [resources, rv] = await call('list_crd_resources', {});
            const resource = apiResourcesState
              .get()
              .find((r: ApiResource) => r.kind === 'CustomResourceDefinition');
            await call('watch_dynamic_resource', {
              request: {
                ...resource,
                resource_version: rv,
              },
            });
            listenEvent(`CustomResourceDefinition-deleted`, async (ev: any) => {
              crdResources.set((prev) => {
                const newMap = new Map(prev);
                newMap.delete(ev.metadata?.uid as string);
                return newMap;
              });
              apiResourcesState.set(await call('list_apiresources', {}));
            });
            listenEvent(`CustomResourceDefinition-updated`, async (ev: any) => {
              crdResources.set((prev) => {
                const newMap = new Map(prev);
                newMap.set(ev.metadata?.uid as string, ev);
                return newMap;
              });
              apiResourcesState.set(await call('list_apiresources', {}));
            });
            resources.forEach((x) => {
              crdResources.set((prev) => {
                const newMap = new Map(prev);
                newMap.set(x.metadata?.uid as string, x);
                return newMap;
              });
            });
            navigate('/cluster');
            return (
              <span>
                Successfully connected to <b>{context}</b> <b>{data.gitVersion}</b>
              </span>
            );
          },
          error: (err) => (
            <span>
              Cant connect to <b>{context}</b>
              <br />
              {err.message}
            </span>
          ),
        });
      };
      return (
        <Button
          className="text-xs hover:bg-green-300"
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
