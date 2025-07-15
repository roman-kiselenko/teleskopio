import { useCurrentClusterState } from '@/store/cluster';
import { useRolesState, getRoles } from '~/store/roles';
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

const Roles = () => {
  const cc = useCurrentClusterState();
  const rolesState = useRolesState();

  useEffect(() => {
    getRoles(cc.kube_config.get(), cc.cluster.get());
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
          {rolesState.roles.get().map((r: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      <span className="font-bold">{r.metadata.namespace}</span>/{r.metadata.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{r.metadata.name}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>{moment(r.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Roles;
