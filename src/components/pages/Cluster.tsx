import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useNodesState, useEventsState, nodesState, eventsState } from '@/store/resources';
import columns from '@/components/pages/Cluster/Table/ColumnDef';
import eventsColumns from '@/components/pages/Cluster/Table/EventsColumnDef';
import { call } from '@/lib/api';
import { listenEvent } from '@/lib/events';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { apiResourcesState } from '@/store/api-resources';
import { ApiResource } from '@/types';

const subscribeNodeEvents = async (rv: string) => {
  const apiResource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Node');
  const request = {
    ...apiResource,
    resource_version: rv,
  };
  await call('watch_dynamic_resource', { request });
};

const subscribeEventEvents = async (rv: string) => {
  const apiResource = apiResourcesState
    .get()
    .find((r: ApiResource) => r.kind === 'Event' && r.group === 'events.k8s.io');
  const request = {
    ...apiResource,
    resource_version: rv,
  };
  await call('watch_dynamic_resource', { request });
};

const listenNodeEvents = async () => {
  await listenEvent('Node-deleted', (node: any) => {
    nodesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(node.metadata.uid);
      return newMap;
    });
  });

  await listenEvent('Node-updated', (node: any) => {
    nodesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(node.metadata.uid, node);
      return newMap;
    });
  });
};

const listenEventEvents = async () => {
  await listenEvent('Event-deleted', (ev: any) => {
    eventsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ev.metadata.uid);
      return newMap;
    });
  });

  await listenEvent('Event-updated', (ev: any) => {
    eventsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ev.metadata.uid, ev);
      return newMap;
    });
  });
};

const getNodesPage = async ({
  limit,
  continueToken,
}: {
  limit: number;
  continueToken?: string;
}) => {
  const apiResource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Node');
  return await call('list_dynamic_resource', {
    limit: limit,
    continueToken: continueToken,
    request: {
      ...apiResource,
    },
  });
};

const getEventsPage = async ({
  limit,
  continueToken,
}: {
  limit: number;
  continueToken?: string;
}) => {
  const apiResource = apiResourcesState
    .get()
    .find((r: ApiResource) => r.kind === 'Event' && r.group === 'events.k8s.io');
  return await call('list_dynamic_resource', {
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
                  withoutJump={true}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
