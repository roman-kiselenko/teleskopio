import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/api-resources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row?.original?.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row?.original?.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'spec.policyTypes',
    id: 'PolicyType',
    header: memo(({ column }) => <HeaderAction column={column} name={'PolicyTypes'} />),
    cell: memo(({ row }) => <div>{row?.original?.spec?.policyTypes}</div>),
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
      const np = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'NetworkPolicy');
      return (
        <Actions
          resource={np}
          url={`/yaml/NetworkPolicy/${np.metadata?.name}/${np.metadata?.namespace}`}
          name={'NetworkPolicy'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: np.metadata?.name,
              namespace: np?.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
