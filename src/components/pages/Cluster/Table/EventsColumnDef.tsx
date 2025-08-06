import { ColumnDef } from '@tanstack/react-table';
import { Event } from 'kubernetes-models/v1';
import { memo } from 'react';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import AgeCell from '@/components/ui/Table/AgeCell';

const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'message',
    id: 'message',
    header: 'Message',
    cell: memo(({ row }) => <div>{row.original.message}</div>),
  },
  {
    accessorKey: 'type',
    id: 'type',
    header: 'Type',
    cell: memo(({ row }) => {
      let color = '';
      if (row.original.type !== 'Normal') {
        color = 'text-orange-500';
      }
      return <div className={color}>{row.original.type}</div>;
    }),
  },
  {
    accessorKey: 'count',
    id: 'count',
    header: memo(({ column }) => <HeaderAction column={column} name={'Count'} />),
    cell: memo(({ row }) => <div>{row.original.count}</div>),
  },
  {
    accessorKey: 'namespace',
    id: 'namespace',
    header: 'Namespace',
    cell: ({ row }) => {
      return <div>{row.original.metadata?.namespace}</div>;
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
