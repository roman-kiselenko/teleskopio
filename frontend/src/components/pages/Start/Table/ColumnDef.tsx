import { Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Cluster } from '@/types';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { call } from '@/lib/api';
import { setVersion } from '@/store/version';
import { setCurrentCluster } from '@/store/cluster';
import { apiResourcesState } from '@/store/apiResources';
import { namespacesState } from '@/store/resources';
import { useloadingState } from '@/store/loader';
import type { ApiResource } from '@/types';
import { useWS } from '@/context/WsContext';

const columns: ColumnDef<Cluster>[] = [
  {
    accessorKey: 'context',
    id: 'context',
    meta: { className: 'max-w-[35ch] truncate' },
    header: memo(({ column }) => <HeaderAction column={column} name={'Context'} />),
    cell: memo(({ row }) => <div>{row.original.current_context}</div>),
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
      const { listen } = useWS();
      const get_version = async (context: string, server: any) => {
        return await call('get_version', { context: context, server: server });
      };
      return (
        <Button
          className="text-xs"
          variant="outline"
          size="sm"
          onClick={async () => {
            loading.set(true);
            const clusterVersion = await get_version(
              row.original.current_context as string,
              row.original.server,
            );
            if (!clusterVersion.gitVersion) {
              loading.set(false);
              toast.error(
                <div>
                  Cant connect to cluster
                  <br />
                  Server: {row.original.server}
                  <br />
                  Context: {row.original.current_context}
                </div>,
              );
              return;
            }
            setVersion(clusterVersion.gitVersion);
            setCurrentCluster(
              row.original.current_context as string,
              row.original.server as string,
            );
            toast.info(<div>Cluster version: {clusterVersion.gitVersion}</div>);
            apiResourcesState.set(
              await call('list_apiresources', {
                context: row.original.current_context,
                server: row.original.server,
              }),
            );
            fetchAndWatchNamespaces(listen, row.original.current_context as string);
            navigate('/resource/Node');
            loading.set(false);
            return;
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

async function fetchAndWatchNamespaces(listen: any, context: string): Promise<void> {
  const nsResource = apiResourcesState
    .get()
    .find((r: ApiResource) => r.kind === 'Namespace' && r.group === '');
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [ns, _token, rv] = await call('list_dynamic_resource', {
    request: { ...nsResource },
  });
  ns.forEach((x) => {
    namespacesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(x.metadata?.uid as string, x);
      return newMap;
    });
  });
  await call('watch_dynamic_resource', {
    request: {
      ...nsResource,
      resource_version: rv,
    },
  });
  listen(`Namespace-${context}-deleted`, async (ev: any) => {
    namespacesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ev.metadata?.uid as string);
      return newMap;
    });
  });
  listen(`Namespace-${context}-updated`, async (ev: any) => {
    namespacesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ev.metadata?.uid as string, ev);
      return newMap;
    });
  });
}
