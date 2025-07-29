import AgeCell from '@/components/ui/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/types';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<Service>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata.namespace}</div>),
  },
  {
    accessorKey: 'spec.type',
    id: 'type',
    header: memo(({ column }) => <HeaderAction column={column} name={'Type'} />),
    cell: memo(({ row }) => <div>{row.original.spec.type}</div>),
  },
  {
    accessorKey: 'spec.clusterIP',
    id: 'clusterIP',
    header: memo(({ column }) => <HeaderAction column={column} name={'ClusterIP'} />),
    cell: memo(({ row }) => <div>{row.original.spec.clusterIP}</div>),
  },
  {
    accessorKey: 'spec.internalTrafficPolicy',
    id: 'internalTrafficPolicy',
    header: memo(({ column }) => <HeaderAction column={column} name={'InternalTrafficPolicy'} />),
    cell: memo(({ row }) => <div>{row.original.spec.internalTrafficPolicy}</div>),
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const service = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceNamespace: service.metadata.namespace,
        resourceName: service.metadata.name,
      };
      return (
        <Actions resource={service} name={'Service'} action={'delete_service'} payload={payload} />
      );
    },
  },
];

export default columns;
