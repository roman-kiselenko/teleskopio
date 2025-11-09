import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import cronstrue from 'cronstrue';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => (
      <div className="flex flex-row items-center">{row.original.metadata?.name}</div>
    )),
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
];

export default columns;
