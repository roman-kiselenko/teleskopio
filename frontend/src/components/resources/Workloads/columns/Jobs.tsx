import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import JobName from '@/components/ui/Table/ResourceName';

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
    accessorKey: 'status.active',
    id: 'active',
    header: memo(({ column }) => <HeaderAction column={column} name={'Active'} />),
    cell: ({ row }) => {
      const active = row.original.status?.active || 0;
      return <div>{active}</div>;
    },
  },
  {
    accessorKey: 'status.ready',
    id: 'replicase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Ready'} />),
    cell: ({ row }) => {
      const ready = row.original.status?.ready;
      const succeeded = row.original.status?.succeeded;
      return (
        <div>
          {ready}/{succeeded}
        </div>
      );
    },
  },
  {
    accessorKey: 'spec.backoffLimit',
    id: 'backofflimit',
    header: 'BackoffLimit',
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
