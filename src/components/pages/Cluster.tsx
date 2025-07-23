import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { useNodesState, getNodes } from '~/store/nodes';
import { useSearchState } from '@/store/search';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { SearchField } from '~/components/SearchField';
import { DataTable } from '@/components/ui/DataTable';
import columns from '@/components/pages/Cluster/Table/ColumnDef';

export function ClusterPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const nodesState = useNodesState();
  const searchQuery = useSearchState();
  const query = searchQuery.q.get();

  useEffect(() => {
    getNodes(cc.kube_config.get(), cc.cluster.get(), query);
  }, [cc.kube_config.get(), cc.cluster.get(), query]);

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center justify-between flex-shrink-0 h-12 border-b border-gray-300">
        <button className="relative focus:outline-none group">
          <SearchField />
        </button>
        <div className="flex items-center justify-between w-full h-12 px-2">
          <span className="hidden md:block text-muted-foreground text-xs font-bold">
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
            <DataTable columns={columns} data={nodesState.nodes.get()} />
          </div>
        </div>
      </div>
    </div>
  );
}
