import { useCurrentClusterState } from '@/store/cluster';
import { useServiceAccountsState, getServiceAccounts } from '~/store/serviceaccounts';
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

const ServiceAccounts = () => {
  const cc = useCurrentClusterState();
  const saState = useServiceAccountsState();

  useEffect(() => {
    getServiceAccounts(cc.kube_config.get(), cc.cluster.get());
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
          {saState.serviceaccounts.get().map((sa: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      <span className="font-bold">{sa.metadata.namespace}</span>/{sa.metadata.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{sa.metadata.name}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>{moment(sa.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceAccounts;
