import { ColumnDef } from '@tanstack/react-table';
import { memo } from 'react';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import AgeCell from '@/components/ui/Table/AgeCell';
import { compareVersions } from 'compare-versions';
import { useVersionState } from '@/store/version';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'message',
    id: 'message',
    header: 'Message',
    meta: { className: 'min-w-[50ch] max-w-[50ch]' },
    cell: memo(({ row }) => {
      const version = useVersionState();
      return (
        <span>
          {compareVersions(version.version.get(), '1.20') === 1
            ? row.original.note
            : row.original.message}
        </span>
      );
    }),
  },
  {
    accessorKey: 'type',
    id: 'type',
    meta: { className: 'min-w-[20ch] max-w-[20ch] truncate' },
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
    meta: { className: 'min-w-[20ch] max-w-[20ch] truncate' },
    cell: memo(({ row }) => {
      return <div>{row.original.reason}</div>;
    }),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    meta: { className: 'min-w-[20ch] max-w-[20ch] truncate' },
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: ({ row }) => {
      return <div>{row.original.metadata?.namespace}</div>;
    },
  },
  {
    id: 'age',
    meta: { className: 'min-w-[10ch] max-w-[10ch] truncate' },
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
