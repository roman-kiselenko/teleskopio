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
    accessorKey: 'status.phase',
    id: 'phase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Phase'} />),
    cell: memo(({ row }) => {
      let color = 'text-green-400';
      if (row.original.status?.phase !== 'Bound') {
        color = 'text-red-400';
      }
      return <div className={color}>{row.original.status?.phase}</div>;
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
        .find((r: ApiResource) => r.kind === 'PersistentVolume');
      return (
        <Actions
          resource={sc}
          url={`/yaml/PersistentVolume/${sc.metadata?.name}/${sc?.metadata?.namespace}?group=`}
          name={'PersistentVolume'}
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
