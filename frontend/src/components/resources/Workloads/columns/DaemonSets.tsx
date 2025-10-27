import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DsName from '@/components/ui/Table/ResourceName';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <DsName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'status.numberReady',
    id: 'NumberReady',
    header: memo(({ column }) => <HeaderAction column={column} name={'NumberReady'} />),
    cell: memo(({ row }) => <div>{row.original.status?.numberReady}</div>),
  },
  {
    accessorKey: 'spec.updateStrategy.type',
    id: 'updateStrategy',
    header: memo(({ column }) => <HeaderAction column={column} name={'UpdateStrategy'} />),
    cell: memo(({ row }) => <div>{row.original.spec.updateStrategy.type}</div>),
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
