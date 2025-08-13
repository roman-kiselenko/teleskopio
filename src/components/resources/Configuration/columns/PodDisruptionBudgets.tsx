import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.name}</div>),
  },
  {
    accessorKey: 'healthy',
    id: 'healthy',
    header: memo(({ column }) => (
      <HeaderAction column={column} name={'DesiredHealthy/CurrentHealthy'} />
    )),
    cell: memo(({ row }) => (
      <div>
        {row.original.status?.desiredHealthy}/{row.original.status?.currentHealthy}
      </div>
    )),
  },
  {
    accessorKey: 'spec.minAvailable',
    id: 'minAvailable',
    header: memo(({ column }) => <HeaderAction column={column} name={'MinAvailable'} />),
    cell: memo(({ row }) => <div>{row.original.spec?.minAvailable}</div>),
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
      const ns = row.original;
      const resource = apiResourcesState
        .get()
        .find((r: ApiResource) => r.kind === 'PodDisruptionBudget');
      return (
        <Actions
          url={`/yaml/PodDisruptionBudget/${ns.metadata?.name}/${ns.metadata?.namespace}`}
          resource={ns}
          name={'PodDisruptionBudget'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: ns.metadata?.name,
              namespace: ns.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
