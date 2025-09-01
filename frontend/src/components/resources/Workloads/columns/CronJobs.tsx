import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import JobName from '@/components/ui/Table/ResourceName';
import cronstrue from 'cronstrue';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
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
              <div className="font-bold">{row.original.spec?.schedule}</div>
            </TooltipTrigger>
            <TooltipContent>
              {cronstrue.toString(row.original.spec?.schedule as string)}
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const cronjob = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'CronJob');
      return (
        <Actions
          url={`/yaml/CronJob/${cronjob.metadata?.name}/${cronjob.metadata?.namespace}?group=${cronjob.apiVersion.split('/')[0]}`}
          resource={cronjob}
          name={'CronJob'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: cronjob.metadata?.name,
              namespace: cronjob?.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
