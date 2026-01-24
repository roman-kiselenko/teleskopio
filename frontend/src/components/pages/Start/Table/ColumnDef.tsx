import { Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ServerInfo } from '@/types';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { call } from '@/lib/api';
import { namespacesState } from '@/store/resources';
import { useloadingState } from '@/store/loader';
import type { ApiResource } from '@/types';
import { useWS } from '@/context/WsContext';
import { useConfig } from '@/context/ConfigContext';
import { addSubscription } from '@/lib/subscriptionManager';
import { crdsState, useCrdResourcesState } from '@/store/crdResources';
import { crsState } from '@/store/resources';

const columns: ColumnDef<ServerInfo>[] = [
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
      const { setConfig } = useConfig();
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
            const si: ServerInfo = {
              server: row.original.server,
              version: clusterVersion.gitVersion,
              apiResources: [],
            };
            setConfig(si);
            toast.info(<div>Cluster version: {si.version}</div>);
            await fetchAndWatchCRDs(listen, si.server as string, si.apiResources);
            Array.from(crdResources.get().values()).forEach((x) => {
              fetchAndWatchCRs(
                listen,
                si.server as string,
                x.spec.names.kind,
                x.spec.group,
                si.apiResources,
              );
            });
            fetchAndWatchNamespaces(listen, si.server as string, si.apiResources);
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

async function fetchAndWatchCRDs(
  listen: any,
  server: string,
  apiResources: ApiResource[],
): Promise<Promise<Promise<void>>> {
  const [resources, rv] = await call('list_crd_resource', { server });
  if (!resources) {
    return;
  }
  if (resources.length === 0) {
    toast.error(<div>CRD Resources not loaded!</div>);
    return;
  }
  toast.info(<div>CRD Resources loaded: {resources.length}</div>);
  const resource = apiResources.find((r: ApiResource) => r.kind === 'CustomResourceDefinition');
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
  addSubscription(
    listen(`CustomResourceDefinition-${server}-deleted`, async (ev: any) => {
      fetchAndWatchCRs(listen, server, ev.spec.names.kind, ev.spec.group, apiResources);
      crdsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ev.metadata?.uid as string);
        return newMap;
      });
    }),
  );
  addSubscription(
    listen(`CustomResourceDefinition-${server}-updated`, async (ev: any) => {
      fetchAndWatchCRs(listen, server, ev.spec.names.kind, ev.spec.group, apiResources);
      crdsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.set(ev.metadata?.uid as string, ev);
        return newMap;
      });
    }),
  );
}

async function fetchAndWatchCRs(
  listen: any,
  server: string,
  kind: string,
  group: string,
  apiResources: ApiResource[],
): Promise<Promise<Promise<void>>> {
  const customResource = apiResources.find(
    (r: ApiResource) => r.kind === kind && r.group === group,
  );
  if (!customResource) {
    return;
  }
  const [resources, rv] = await call('list_dynamic_resource', {
    apiResource: { ...customResource },
  });
  crsState.set((prev) => {
    const newMap = new Map(prev);
    resources.forEach((item) => {
      newMap.set(item.metadata.uid, item);
    });
    return newMap;
  });
  if (kind === 'ComponentStatus') {
    return;
  }
  await call('watch_dynamic_resource', {
    apiResource: { ...customResource, resource_version: rv },
  });
  addSubscription(
    listen(`${kind}-${server}-deleted`, (ev: any) => {
      crsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ev.metadata.uid);
        return newMap;
      });
    }),
  );
  addSubscription(
    listen(`${kind}-${server}-updated`, (ev: any) => {
      crsState.set((prev) => {
        const newMap = new Map(prev);
        newMap.set(ev.metadata.uid, ev);
        return newMap;
      });
    }),
  );
}

async function fetchAndWatchNamespaces(
  listen: any,
  server: any,
  apiResources: ApiResource[],
): Promise<void> {
  const nsResource = apiResources.find(
    (r: ApiResource) => r.kind === 'Namespace' && r.group === '',
  );
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [ns, _token, rv] = await call('list_dynamic_resource', {
    apiResource: { ...nsResource },
  });
  if (!ns) {
    return;
  }
  ns.forEach((x) => {
    namespacesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(x.metadata?.uid as string, x);
      return newMap;
    });
  });
  await call('watch_dynamic_resource', {
    apiResource: {
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
