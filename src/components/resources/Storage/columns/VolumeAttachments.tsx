import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => {
      return <div>{row.original.metadata?.name}</div>;
    }),
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
      const sc = row.original;
      const resource = apiResourcesState
        .get()
        .find((r: ApiResource) => r.kind === 'VolumeAttachment');
      return (
        <Actions
          resource={sc}
          url={`/yaml/VolumeAttachment/${sc.metadata?.name}/${sc?.metadata?.namespace}?group=${sc.apiVersion.split('/')[0]}`}
          name={'VolumeAttachment'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: sc.metadata?.name,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
