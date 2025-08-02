import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CronJob } from '@/types';
import JobName from '@/components/ui/Table/ResourceName';
import cronstrue from 'cronstrue';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<CronJob>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata.namespace}</div>),
  },
  {
    accessorKey: 'spec.schedule',
    id: 'schedule',
    header: 'Schedule',
    cell: ({ row }) => {
      return (
        <div className="flex flex-row items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="font-bold">{row.original.spec.schedule}</div>
            </TooltipTrigger>
            <TooltipContent>{cronstrue.toString(row.original.spec.schedule)}</TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const cronjob = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceNamespace: cronjob.metadata.namespace,
        resourceName: cronjob.metadata.name,
      };
      return (
        <Actions resource={cronjob} name={'CronJob'} action={'delete_cronjob'} payload={payload} />
      );
    },
  },
];

export default columns;
