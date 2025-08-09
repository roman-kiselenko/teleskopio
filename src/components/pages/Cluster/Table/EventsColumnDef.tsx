import { ColumnDef } from '@tanstack/react-table';
import { memo } from 'react';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import AgeCell from '@/components/ui/Table/AgeCell';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'message',
    id: 'message',
    header: 'Message',
    cell: memo(({ row }) => {
      return <div className="w-1/2">{row.original.message}</div>;
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
      return <div>{row.original.reason}</div>;
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
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
