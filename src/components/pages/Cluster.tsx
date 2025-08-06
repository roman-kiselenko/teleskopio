import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { currentClusterState } from '@/store/cluster';
import { useNodesState, useEventsState, nodesState, eventsState } from '@/store/resources';
import columns from '@/components/pages/Cluster/Table/ColumnDef';
import eventsColumns from '@/components/pages/Cluster/Table/EventsColumnDef';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Node, Event } from 'kubernetes-models/v1';

const subscribeNodeEvents = async (rv: string) => {
  await invoke('node_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const subscribeEventEvents = async (rv: string) => {
  await invoke('event_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenNodeEvents = async () => {
  await listen<any>('node-deleted', (event) => {
    const no = event.payload;
    nodesState.set((prev) => {
      const newMap = new Map<string, Node>(prev);
      newMap.delete(no.metadata.uid);
      return newMap;
    });
  });

  await listen<any>('node-updated', (event) => {
    const no = event.payload;
    nodesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(no.metadata.uid, no);
      return newMap;
    });
  });
};

const listenEventEvents = async () => {
  await listen<any>('event-deleted', (event) => {
    const ev = event.payload;
    eventsState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ev.metadata.uid);
      return newMap;
    });
  });

  await listen<any>('event-updated', (event) => {
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
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Node[], string | null, string]>('get_nodes_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const getEventsPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Event[], string | null, string]>('get_events_page', {
    path,
    context,
    limit: 50,
    continueToken,
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
                  state={() => nodesState.get() as Map<string, Node>}
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
                  state={() => eventsState.get() as Map<string, Event>}
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
