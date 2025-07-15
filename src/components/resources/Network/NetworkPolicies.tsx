import { useCurrentClusterState } from '@/store/cluster';
import { useNetworkPoliciesState, getNetworkPolicies } from '~/store/networkpolicies';
import { useEffect } from 'react';
import moment from 'moment';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const Networkpolicies = () => {
  const cc = useCurrentClusterState();
  const npState = useNetworkPoliciesState();

  useEffect(() => {
    getNetworkPolicies(cc.kube_config.get(), cc.cluster.get());
  }, [cc.kube_config.get(), cc.cluster.get()]);

  return (
    <div className="h-24 col-span-1">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium text-xs">
          {npState.networkpolicies.get().map((np: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      <span className="font-bold">{np.metadata.namespace}</span>/{np.metadata.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{np.metadata.name}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>{moment(np.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Networkpolicies;
