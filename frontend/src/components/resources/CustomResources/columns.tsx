import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import JobName from '@/components/ui/Table/ResourceName';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    meta: { className: 'min-w-[35ch] max-w-[35ch] truncate' },
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    id: 'creationTimestamp',
    meta: { className: 'min-w-[35ch] max-w-[35ch] truncate' },
    accessorFn: (row) => row.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
