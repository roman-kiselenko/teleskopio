import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useVersionState } from '@/store/version';
import { useCurrentClusterState, currentClusterState } from '@/store/cluster';
import { useNodesState, nodesState } from '@/store/resources';
import { SearchField } from '~/components/SearchField';
import columns from '@/components/pages/Cluster/Table/ColumnDef';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Node } from '@/types';

const subscribeNodeEvents = async (rv: string) => {
  await invoke('node_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenNodeEvents = async () => {
  await listen<Node>('node-deleted', (event) => {
    const no = event.payload;
    nodesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(no.metadata.uid);
      return newMap;
    });
  });

  await listen<Node>('node-updated', (event) => {
    const no = event.payload;
    nodesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(no.metadata.uid, no);
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

export function ClusterPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const nodesState = useNodesState();
  listenNodeEvents();

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center justify-between flex-shrink-0 h-12 border-b border-gray-300">
        <button className="relative focus:outline-none group">
          <SearchField />
        </button>
        <div className="flex items-center justify-between w-full h-12 px-2">
          <span className="hidden md:block mx-auto text-muted-foreground text-xs font-bold">
            {cc.cluster.get()} {cv.version.get()}
          </span>
        </div>
        <div className="relative focus:outline-none group">
          <div className="flex items-center w-full h-12 px-4"></div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          <div className="h-24 col-span-2">
            <PaginatedTable<Node>
              subscribeEvents={subscribeNodeEvents}
              getPage={getNodesPage}
              state={() => nodesState.get() as Map<string, Node>}
              setState={nodesState.set}
              extractKey={(p) => p.metadata.uid}
              columns={columns}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
