import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DsName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/api-resources';

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
    accessorKey: 'spec.replicas',
    id: 'replicase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Replicas'} />),
    cell: ({ row }) => {
      const replicas = row.original.spec?.replicas;
      const availableReplicas = row.original.status?.availableReplicas || 0;
      return (
        <div>
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
  {
    id: 'actions',
    cell: ({ row }) => {
      const dp = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Deployment');
      return (
        <Actions
          url={`/yaml/Deployment/${dp.metadata?.name}/${dp?.metadata?.namespace}`}
          resource={dp}
          name={'Deployment'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: dp.metadata?.name,
              namespace: dp?.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
