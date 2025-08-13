import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    id: 'creationTimestamp',
    accessorFn: (row) => row.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const cm = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'ResourceQuota');
      return (
        <Actions
          url={`/yaml/ResourceQuota/${cm.metadata?.name}/${cm.metadata?.namespace}`}
          resource={cm}
          name={'ResourceQuota'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: cm.metadata?.name,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
