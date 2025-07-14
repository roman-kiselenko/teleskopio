import { useCurrentClusterState } from '@/store/cluster';
import { useConfigmapsState, getConfigmaps } from '~/store/configmaps';
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

const Configmaps = () => {
  const cc = useCurrentClusterState();
  const configmapsState = useConfigmapsState();

  useEffect(() => {
    getConfigmaps(cc.kube_config.get(), cc.cluster.get());
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
          {configmapsState.configmaps.get().map((cm: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      <span className="font-bold">{cm.metadata.namespace}</span>/{cm.metadata.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{cm.metadata.name}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>{moment(cm.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Configmaps;
