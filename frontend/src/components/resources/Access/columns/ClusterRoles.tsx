import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    meta: { className: 'min-w-[30ch] max-w-[30ch]' },
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => (
      <div className="flex flex-row items-center">{row.original.metadata?.name}</div>
    )),
  },
  {
    id: 'age',
    meta: { className: 'min-w-[20ch] max-w-[20ch]' },
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
