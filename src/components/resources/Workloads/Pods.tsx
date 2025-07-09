import { useCurrentClusterState } from '@/store/cluster';
import { usePodsState, getPods } from '~/store/pods';
import { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Pods = () => {
  const cc = useCurrentClusterState();
  const podsState = usePodsState();

  useEffect(() => {
    getPods(cc.kube_config.get(), cc.cluster.get());
  }, [cc.kube_config.get(), cc.cluster.get()]);

  return (
    <div className="h-24 col-span-1">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Containers</TableHead>
            <TableHead>Node</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium text-xs">
          {podsState.pods.get().map((pod: any, index) => (
            <TableRow key={index}>
              <TableCell>
                {pod.metadata.namespace}/{pod.metadata.name}
              </TableCell>
              <TableCell>
                {pod.spec.containers.length}/
                {pod.status.containerStatuses.filter((c) => c.started).length}
              </TableCell>
              <TableCell>{pod.spec.nodeName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Pods;
