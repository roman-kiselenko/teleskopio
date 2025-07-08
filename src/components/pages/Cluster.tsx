import { useVersionState } from '../../store/version';
import { useCurrentClusterState } from '../../store/currentCluster';
import { useNodesState, getNodes } from '../../store/nodes';
import { useEffect } from 'react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ClusterPage() {
  const clusterVersion = useVersionState();
  const currentCluster = useCurrentClusterState();
  const nodes = useNodesState();

  useEffect(() => {
    getNodes(currentCluster.kube_config.get(), currentCluster.cluster.get());
  }, [currentCluster.kube_config.get(), currentCluster.cluster.get()]);

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center flex-shrink-0 h-12 border-b border-gray-300">
        <div className="flex items-center justify-between w-full h-12 px-2 hover:bg-blue-300">
          <span className="font-medium">
            {currentCluster.cluster.get()}:{clusterVersion.version.get()}
          </span>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-3">
          <div className="h-24 col-span-2 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Credit Card</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {/* <Nodes nodes={nodes.nodes.get().slice()} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
