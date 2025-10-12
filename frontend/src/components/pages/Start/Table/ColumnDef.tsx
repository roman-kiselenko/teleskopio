import { Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { addSubscription } from '@/lib/subscriptionManager';
import { useCrdResourcesState } from '@/store/crdResources';

const columns: ColumnDef<Cluster>[] = [
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
      const crdResources = useCrdResourcesState();
      const { listen } = useWS();
      const get_version = async (server: any) => {
        return await call('get_version', { server: server });
      };
      return (
        <Button
          className="text-xs"
          variant="outline"
          size="sm"
          onClick={async () => {
            loading.set(true);
            const clusterVersion = await get_version(row.original.server);
            if (!clusterVersion.gitVersion) {
              loading.set(false);
              toast.error(
                <div>
                  Cant connect to cluster
                  <br />
                  Server: {row.original.server}
                </div>,
              );
              return;
            }
            setVersion(clusterVersion.gitVersion);
            setCurrentCluster(row.original.server);
            toast.info(<div>Cluster version: {clusterVersion.gitVersion}</div>);
            apiResourcesState.set(await call('list_apiresources', { server: row.original.server }));
            const [resources, rv] = await call('list_crd_resource', {
              server: row.original.server,
            });
            // TODO crd
            (resources || []).forEach((x) => {
              crdResources.set((prev) => {
                const newMap = new Map(prev);
                newMap.set(x.metadata?.uid as string, x);
                return newMap;
              });
            });
            fetchAndWatchNamespaces(listen, row.original.server);
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

async function fetchAndWatchNamespaces(listen: any, server: any): Promise<void> {
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
  addSubscription(
    listen(`Namespace-${server}-deleted`, async (ev: any) => {
      namespacesState.set((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ev.metadata?.uid as string);
        return newMap;
      });
    }),
  );
  addSubscription(
    listen(`Namespace-${server}-updated`, async (ev: any) => {
      namespacesState.set((prev) => {
        const newMap = new Map(prev);
        newMap.set(ev.metadata?.uid as string, ev);
        return newMap;
      });
    }),
  );
}
