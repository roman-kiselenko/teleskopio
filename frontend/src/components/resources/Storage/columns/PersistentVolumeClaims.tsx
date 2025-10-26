import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => {
      return <div>{row.original.metadata?.name}</div>;
    }),
  },
  {
    accessorKey: 'spec.storageClassName',
    id: 'storageClassName',
    header: memo(({ column }) => <HeaderAction column={column} name={'StorageClassName'} />),
    cell: memo(({ row }) => {
      return <div>{row.original.spec?.storageClassName}</div>;
    }),
  },
  {
    accessorKey: 'status.capacity.storage',
    id: 'capacity',
    header: memo(({ column }) => <HeaderAction column={column} name={'Capacity'} />),
    cell: memo(({ row }) => {
      return <div>{row.original.status?.capacity?.storage}</div>;
    }),
  },
  {
    accessorKey: 'status.phase',
    id: 'phase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Phase'} />),
    cell: memo(({ row }) => {
      let color = 'text-green-400';
      if (row.original.status?.phase !== 'Bound') {
        color = 'text-red-400';
      }
      return <div className={color}>{row.original.status?.phase}</div>;
    }),
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
