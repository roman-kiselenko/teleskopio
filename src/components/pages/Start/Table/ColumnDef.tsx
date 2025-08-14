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
        await fetchAndWatchCRDs(context);
        Array.from(crdsState.get().values()).forEach((x) => {
          fetchAndWatchCRs(context, x.spec.names.kind, x.spec.group);
        });
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
                navigate('/cluster');
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

async function fetchAndWatchCRs(
  context: string,
  kind: string,
  group: string,
): Promise<Promise<Promise<void>>> {
  const customResource = apiResourcesState
    .get()
    .find((r: ApiResource) => r.kind === kind && r.group === group);
  console.log(customResource);
  const [resources, rv] = await call('list_dynamic_resource', {
    request: { ...customResource },
  });
  crsState.set((prev) => {
    const newMap = new Map(prev);
    resources.forEach((item) => {
      newMap.set(item.metadata.uid, item);
    });
    return newMap;
  });
  const request = {
    ...customResource,
    resource_version: rv,
  };
  await call('watch_dynamic_resource', { request });
  addSubscription(
    listenEvent(`${kind}-${context}-deleted`, (ev: any) => {
      crsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ev.metadata.uid);
        return newMap;
      });
    }),
  );
  addSubscription(
    listenEvent(`${kind}-${context}-updated`, (ev: any) => {
      crsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.set(ev.metadata.uid, ev);
        return newMap;
      });
    }),
  );
}

async function fetchAndWatchCRDs(context: string): Promise<Promise<Promise<void>>> {
  const resource = apiResourcesState
    .get()
    .find((r: ApiResource) => r.kind === 'CustomResourceDefinition');
  const [resources, rv] = await call('list_crd_resources', {});
  if (resources.length > 0) {
    toast.info(<div>CRD Resources loaded: {resources.length}</div>);
  }
  await call('watch_dynamic_resource', { request: { ...resource, resource_version: rv } });
  resources
    .filter((x) => x.kind !== 'SelfSubjectReview')
    .forEach((x) => {
      crdsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.set(x.metadata?.uid as string, x);
        return newMap;
      });
    });
  await addSubscription(
    listenEvent(`CustomResourceDefinition-${context}-deleted`, async (ev: any) => {
      apiResourcesState.set(await call('list_apiresources', {}));
      fetchAndWatchCRs(context, ev.spec.names.kind, ev.spec.group);
      crdsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ev.metadata?.uid as string);
        return newMap;
      });
    }),
  );
  await addSubscription(
    listenEvent(`CustomResourceDefinition-${context}-updated`, async (ev: any) => {
      apiResourcesState.set(await call('list_apiresources', {}));
      fetchAndWatchCRs(context, ev.spec.names.kind, ev.spec.group);
      crdsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.set(ev.metadata?.uid as string, ev);
        return newMap;
      });
    }),
  );
}

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
