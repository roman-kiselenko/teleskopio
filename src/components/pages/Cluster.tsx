import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { useNodesState, getNodes } from '~/store/nodes';
import { useSearchState } from '@/store/search';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import moment from 'moment';
import { SearchField } from '~/components/SearchField';

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
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Kubelet</TableHead>
                  <TableHead>Container Runtime</TableHead>
                  <TableHead>Age</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-medium text-xs">
                {nodesState.nodes.get().map((node: any, index) => (
                  <TableRow key={index}>
                    <TableCell>{node.metadata.name}</TableCell>
                    <TableCell>
                      <Badge
                        className="text-xs"
                        variant={
                          node.metadata.labels.hasOwnProperty(
                            'node-role.kubernetes.io/control-plane',
                          )
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {node.metadata.labels.hasOwnProperty(
                          'node-role.kubernetes.io/control-plane',
                        )
                          ? 'control-plane'
                          : 'worker'}
                      </Badge>
                    </TableCell>
                    <TableCell>{node.spec.podCIDR}</TableCell>
                    <TableCell>{node.status.nodeInfo.kubeletVersion}</TableCell>
                    <TableCell>{node.status.nodeInfo.containerRuntimeVersion}</TableCell>
                    <TableCell>{moment(node.metadata.creationTimestamp).fromNow()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
