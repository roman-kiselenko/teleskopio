import { Info, Package } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { memo } from 'react';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import AgeCell from '@/components/ui/Table/AgeCell';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NavLink } from 'react-router-dom';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'note',
    id: 'note',
    header: 'Message',
    cell: memo(({ row }) => {
      return <div className="w-1/2">{row.original.note}</div>;
    }),
  },
  {
    accessorKey: 'type',
    id: 'type',
    header: memo(({ column }) => <HeaderAction column={column} name={'Type'} />),
    cell: memo(({ row }) => {
      let color = '';
      if (row.original.type !== 'Normal') {
        color = 'text-orange-500';
      }
      return <div className={color}>{row.original.type}</div>;
    }),
  },
  {
    accessorKey: 'reason',
    id: 'reason',
    header: 'Reason',
    cell: memo(({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-row items-center w-1/5">
              <div className="mr-1">
                <Info size={15} />{' '}
              </div>{' '}
              <div>{row.original.reason}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {row.original.reportingInstance === undefined
              ? ''
              : `${row.original.reportingInstance}:`}
            {row.original.reportingController}
          </TooltipContent>
        </Tooltip>
      );
    }),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: ({ row }) => {
      return <div>{row.original.metadata?.namespace}</div>;
    },
  },
  {
    accessorKey: 'regarding',
    id: 'object',
    header: 'Object',
    cell: ({ row }) => {
      return (
        <div className="flex flex-row w-full items-center">
          <Package size={16} className="mr-1" />
          <div className="text-xs">{row?.original.regarding.kind}</div>
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
