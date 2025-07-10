import { useCurrentClusterState } from '@/store/cluster';
import { useDeploymentsState, getDeployments } from '@/store/deployments';
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

const Deployments = () => {
  const cc = useCurrentClusterState();
  const deploymentsState = useDeploymentsState();

  useEffect(() => {
    getDeployments(cc.kube_config.get(), cc.cluster.get());
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
          {deploymentsState.deployments.get().map((deployment: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="font-bold">{deployment.metadata.namespace}</span>/
                {deployment.metadata.name}
              </TableCell>
              <TableCell>
                {deployment.spec.replicas}/{deployment.status.replicas}
              </TableCell>
              <TableCell>{moment(deployment.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Deployments;
