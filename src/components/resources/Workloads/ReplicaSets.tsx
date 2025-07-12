import { useCurrentClusterState } from '@/store/cluster';
import { useReplicaSetsState, getReplicaSets } from '@/store/replicasets';
import { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import moment from 'moment';

const ReplicaSets = () => {
  const cc = useCurrentClusterState();
  const replicaSetsState = useReplicaSetsState();

  useEffect(() => {
    getReplicaSets(cc.kube_config.get(), cc.cluster.get());
  }, [cc.kube_config.get(), cc.cluster.get()]);

  return (
    <div className="h-24 col-span-1">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Replicas</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium text-xs">
          {replicaSetsState.replicasets.get().map((rs: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="font-bold">{rs.metadata.namespace}</span>/{rs.metadata.name}
              </TableCell>
              <TableCell>{rs.status.replicas}</TableCell>
              <TableCell>{moment(rs.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReplicaSets;
