import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

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
    accessorKey: 'spec.strategy.type',
    id: 'strategy',
    header: 'Strategy',
    cell: memo(({ row }) => <div>{row.original.spec?.strategy.type}</div>),
  },
  {
    accessorKey: 'spec.replicas',
    id: 'replicase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Replicas'} />),
    cell: ({ row }) => {
      const replicas = row.original.spec?.replicas;
      const availableReplicas = row.original.status?.availableReplicas || 0;
      let color = '';
      if (availableReplicas < replicas) {
        color = 'text-red-500';
      }
      return (
        <div className={color}>
          {replicas}/{availableReplicas}
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
