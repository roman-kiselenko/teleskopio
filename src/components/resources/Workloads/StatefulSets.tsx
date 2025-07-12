import { useCurrentClusterState } from '@/store/cluster';
import { useStatefulSetsState, getStatefulSets } from '@/store/statefulsets';
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

const StatefulSets = () => {
  const cc = useCurrentClusterState();
  const statefulSetsState = useStatefulSetsState();

  useEffect(() => {
    getStatefulSets(cc.kube_config.get(), cc.cluster.get());
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
          {statefulSetsState.statefulsets.get().map((ss: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="font-bold">{ss.metadata.namespace}</span>/{ss.metadata.name}
              </TableCell>
              <TableCell>{ss.status.replicas}</TableCell>
              <TableCell>{moment(ss.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StatefulSets;
