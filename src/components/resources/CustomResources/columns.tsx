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
    meta: { className: 'min-w-[35ch] max-w-[35ch] truncate' },
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    id: 'creationTimestamp',
    meta: { className: 'min-w-[35ch] max-w-[35ch] truncate' },
    accessorFn: (row) => row.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    meta: { className: 'min-w-[35ch] max-w-[35ch] truncate' },
    cell: ({ row }) => {
      const cm = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === cm.kind);
      return (
        <Actions
          url={`/yaml/${cm.kind}/${cm.metadata?.name}/${cm.metadata?.namespace}?group=${cm.apiVersion.split('/')[0]}`}
          resource={cm}
          name={cm.kind}
          noEvents={true}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: cm.metadata?.name,
              namespace: cm.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
