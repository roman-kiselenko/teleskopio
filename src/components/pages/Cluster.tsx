import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { currentClusterState } from '@/store/cluster';
import { useNodesState, useEventsState, nodesState, eventsState } from '@/store/resources';
import columns from '@/components/pages/Cluster/Table/ColumnDef';
import eventsColumns from '@/components/pages/Cluster/Table/EventsColumnDef';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { apiResourcesState } from '@/store/api-resources';
import { ApiResource } from '@/types';

const subscribeNodeEvents = async (rv: string) => {
  const apiResource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Node');
  await invoke('watch_dynamic_resource', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    request: {
      ...apiResource,
      resource_version: rv,
    },
  });
};

const subscribeEventEvents = async (rv: string) => {
  const apiResource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Event');
  await invoke('watch_dynamic_resource', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    request: {
      ...apiResource,
      resource_version: rv,
    },
  });
};

const listenNodeEvents = async () => {
  await listen<any>('Node-deleted', (event) => {
    const no = event.payload;
    nodesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(no.metadata.uid);
      return newMap;
    });
  });

  await listen<any>('Node-updated', (event) => {
    const no = event.payload;
    nodesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(no.metadata.uid, no);
      return newMap;
    });
  });
};

const listenEventEvents = async () => {
  await listen<any>('Event-deleted', (event) => {
    const ev = event.payload;
    eventsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ev.metadata.uid);
      return newMap;
    });
  });

  await listen<any>('Event-updated', (event) => {
    const ev = event.payload;
    eventsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ev.metadata.uid, ev);
      return newMap;
    });
  });
};

const getNodesPage = async ({
  path,
  context,
  limit,
  continueToken,
}: {
  path: string;
  context: string;
  limit: number;
  continueToken?: string;
}) => {
  const apiResource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Node');
  return await invoke<[any[], string | null, string]>('list_dynamic_resource', {
    path: path,
    context: context,
    limit: 50,
    continueToken: continueToken,
    request: {
      ...apiResource,
    },
  });
};

const getEventsPage = async ({
  path,
  context,
  limit,
  continueToken,
}: {
  path: string;
  context: string;
  limit: number;
  continueToken?: string;
}) => {
  const apiResource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Event');
  return await invoke<[any[], string | null, string]>('list_dynamic_resource', {
    path: path,
    context: context,
    limit: limit,
    continueToken: continueToken,
    request: {
      ...apiResource,
      namespaced: false,
    },
  });
};

export function ClusterPage() {
  const nodesState = useNodesState();
  const eventsState = useEventsState();
  listenNodeEvents();
  listenEventEvents();
  return (
    <div className="flex flex-col flex-grow overflow-auto">
      <ResizablePanelGroup direction="horizontal" className="rounded-l">
        <ResizableHandle />
        <ResizablePanel defaultSize={100}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full flex-col">
                <PaginatedTable<Node>
                  subscribeEvents={subscribeNodeEvents}
                  getPage={getNodesPage}
                  state={() => nodesState.get() as Map<string, any>}
                  setState={nodesState.set}
                  extractKey={(p: any) => p.metadata.uid}
                  columns={columns}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full flex-col">
                <PaginatedTable<Event>
                  subscribeEvents={subscribeEventEvents}
                  getPage={getEventsPage}
                  state={() => eventsState.get() as Map<string, any>}
                  setState={eventsState.set}
                  extractKey={(p: any) => p.metadata.uid}
                  columns={eventsColumns}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
