import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useNodesState, useEventsState, nodesState, eventsState } from '@/store/resources';
import columns from '@/components/pages/Cluster/Table/ColumnDef';
import eventsColumns from '@/components/pages/Cluster/Table/EventsColumnDef';
import { call } from '@/lib/api';
import { listenEvent } from '@/lib/events';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { apiResourcesState } from '@/store/api-resources';
import { ApiResource } from '@/types';
import { getVersion } from '@/store/version';
import { compareVersions } from 'compare-versions';
import { debounce } from 'lodash';
import { currentClusterState } from '@/store/cluster';
import { addSubscription } from '@/lib/subscriptionManager';

const subscribeNodeEvents = async (rv: string) => {
  const apiResource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Node');
  const request = {
    ...apiResource,
    resource_version: rv,
  };
  await call('watch_dynamic_resource', { request });
};

const subscribeEventEvents = async (rv: string) => {
  const resource = apiResourcesState.get().find((r: ApiResource) => {
    if (compareVersions(getVersion(), '1.20') === 1) {
      return r.kind === 'Event' && r.group === 'events.k8s.io';
    } else {
      return r.kind === 'Event' && r.group === '';
    }
  });
  const request = {
    ...resource,
    resource_version: rv,
  };
  await call('watch_dynamic_resource', { request });
};

const listenNodeEvents = async () => {
  const context = currentClusterState.context.get();
  await addSubscription(
    listenEvent(`Node-${context}-deleted`, (node: any) => {
      nodesState.set((prev) => {
        const newMap = new Map(prev);
        newMap.delete(node.metadata.uid);
        return newMap;
      });
    }),
  );

  await addSubscription(
    listenEvent(`Node-${context}-updated`, (node: any) => {
      nodesState.set((prev) => {
        const newMap = new Map(prev);
        newMap.set(node.metadata.uid, node);
        return newMap;
      });
    }),
  );
};

const updateData = debounce((ev) => {
  eventsState.set((prev) => {
    const newMap = new Map(prev);
    newMap.set(ev.metadata.uid, ev);
    return newMap;
  });
}, 100);

const deleteData = debounce((ev) => {
  eventsState.set((prev) => {
    const newMap = new Map(prev);
    newMap.delete(ev.metadata.uid);
    return newMap;
  });
}, 100);

const listenEventEvents = async () => {
  const context = currentClusterState.context.get();
  await addSubscription(
    listenEvent(`Event-${context}-deleted`, (ev: any) => {
      deleteData(ev);
    }),
  );

  await addSubscription(
    listenEvent(`Event-${context}-updated`, (ev: any) => {
      updateData(ev);
    }),
  );
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
  const apiResource = apiResourcesState.get().find((r: ApiResource) => {
    if (compareVersions(getVersion(), '1.20') === 1) {
      return r.kind === 'Event' && r.group === 'events.k8s.io';
    } else {
      return r.kind === 'Event' && r.group === '';
    }
  });
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
