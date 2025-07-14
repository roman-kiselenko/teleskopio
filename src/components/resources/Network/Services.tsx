import { useCurrentClusterState } from '@/store/cluster';
import { useServicesState, getServices } from '~/store/services';
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

const Services = () => {
  const cc = useCurrentClusterState();
  const servicesState = useServicesState();

  useEffect(() => {
    getServices(cc.kube_config.get(), cc.cluster.get());
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
          {servicesState.services.get().map((s: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      <span className="font-bold">{s.metadata.namespace}</span>/{s.metadata.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{s.metadata.name}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>{moment(s.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Services;
