import { useCurrentClusterState } from '@/store/cluster';
import { useDaemonSetsState, getDaemonSets } from '@/store/daemonsets';
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

const DaemonSets = () => {
  const cc = useCurrentClusterState();
  const daemonSetsState = useDaemonSetsState();

  useEffect(() => {
    getDaemonSets(cc.kube_config.get(), cc.cluster.get());
  }, [cc.kube_config.get(), cc.cluster.get()]);

  return (
    <div className="h-24 col-span-1">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Current/Desired</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium text-xs">
          {daemonSetsState.daemonsets.get().map((ds: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="font-bold">{ds.metadata.namespace}</span>/{ds.metadata.name}
              </TableCell>
              <TableCell>
                {ds.status.currentNumberScheduled}/{ds.status.desiredNumberScheduled}
              </TableCell>
              <TableCell>{moment(ds.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DaemonSets;
