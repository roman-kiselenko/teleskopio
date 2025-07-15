import { useCurrentClusterState } from '@/store/cluster';
import { useIngressesState, getIngresses } from '~/store/ingresses';
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

const Ingresses = () => {
  const cc = useCurrentClusterState();
  const ingressesState = useIngressesState();

  useEffect(() => {
    getIngresses(cc.kube_config.get(), cc.cluster.get());
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
          {ingressesState.ingresses.get().map((i: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      <span className="font-bold">{i.metadata.namespace}</span>/{i.metadata.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{i.metadata.name}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>{moment(i.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Ingresses;
