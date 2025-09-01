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
    meta: { className: 'min-w-[30ch] max-w-[30ch]' },
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    id: 'creationTimestamp',
    meta: { className: 'min-w-[20ch] max-w-[20ch]' },
    accessorFn: (row) => row.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    cell: ({ row }) => {
      const cm = row.original;
      const resource = apiResourcesState
        .get()
        .find((r: ApiResource) => r.kind === 'MutatingWebhookConfiguration');
      return (
        <Actions
          url={`/yaml/MutatingWebhookConfiguration/${cm.metadata?.name}/${cm.metadata?.namespace}?group=${cm.apiVersion.split('/')[0]}`}
          resource={cm}
          name={'MutatingWebhookConfiguration'}
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
