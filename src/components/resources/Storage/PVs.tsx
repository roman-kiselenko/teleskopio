import { useCurrentClusterState } from '@/store/cluster';
import { usePvsState, getPvs } from '~/store/pvs';
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

const PVs = () => {
  const cc = useCurrentClusterState();
  const pvsState = usePvsState();

  useEffect(() => {
    getPvs(cc.kube_config.get(), cc.cluster.get());
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
          {pvsState.pvs.get().map((pv: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      <span className="font-bold">{pv.metadata.namespace}</span>/{pv.metadata.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{pv.metadata.name}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>{moment(pv.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PVs;
