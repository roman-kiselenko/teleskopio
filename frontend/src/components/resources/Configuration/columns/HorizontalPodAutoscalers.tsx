import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';
import { NavLink } from 'react-router-dom';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.name}</div>),
  },
  {
    id: 'target',
    accessorKey: 'spec.target',
    header: memo(({ column }) => <HeaderAction column={column} name={'Target'} />),
    cell: memo(({ row }) => {
      let url = '';
      let group = '';
      let kind = '';
      if (row.original?.spec?.scaleTargetRef?.apiVersion?.includes('/')) {
        group = row.original?.spec?.scaleTargetRef?.apiVersion?.split('/')[0];
      }
      url = `/yaml/${row.original?.spec?.scaleTargetRef?.kind}/${row.original?.spec?.scaleTargetRef?.name}/${row.original?.metadata?.namespace}?group=${group}`;
      kind = row.original?.spec?.scaleTargetRef?.kind;
      return (
        <NavLink to={url} className="underline">
          <div className="text-xs">{kind}</div>
        </NavLink>
      );
    }),
  },
  {
    id: 'replicas',
    accessorKey: 'Replicas',
    header: 'Replicas',
    cell: ({ row }) => {
      const currentReplicas = row.original.status?.currentReplicas;
      const desiredReplicas = row.original.status?.desiredReplicas || 0;
      let color = '';
      if (desiredReplicas < currentReplicas) {
        color = 'text-red-500';
      }
      return (
        <div className={color}>
          {currentReplicas}/{desiredReplicas}
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
      const ns = row.original;
      const resource = apiResourcesState
        .get()
        .find((r: ApiResource) => r.kind === 'HorizontalPodAutoscaler');
      return (
        <Actions
          url={`/yaml/HorizontalPodAutoscaler/${ns.metadata?.name}/${ns.metadata?.namespace}?group=${ns.apiVersion.split('/')[0]}`}
          resource={ns}
          name={'HorizontalPodAutoscaler'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: ns.metadata?.name,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
