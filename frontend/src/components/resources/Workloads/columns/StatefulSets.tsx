import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SsName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <SsName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'spec.updateStrategy.type',
    id: 'updateStrategy',
    header: 'UpdateStrategy',
    cell: memo(({ row }) => <div>{row.original.spec?.updateStrategy.type}</div>),
  },
  {
    accessorKey: 'replicas',
    id: 'replicas',
    header: memo(({ column }) => <HeaderAction column={column} name={'Replicas'} />),
    cell: ({ row }) => {
      const currentReplicas = row.original.spec?.replicas;
      const availableReplicas = row.original.status?.availableReplicas;
      let color = '';
      if (availableReplicas < currentReplicas) {
        color = 'text-red-500';
      }
      return (
        <div className={color}>
          {currentReplicas}/{availableReplicas}
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
      const ss = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'StatefulSet');
      return (
        <Actions
          url={`/yaml/StatefulSet/${ss.metadata?.name}/${ss?.metadata?.namespace}?group=${ss.apiVersion.split('/')[0]}`}
          resource={ss}
          name={'StatefulSet'}
          scale={true}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: ss.metadata?.name,
              namespace: ss?.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
