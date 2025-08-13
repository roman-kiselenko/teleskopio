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
    accessorKey: 'namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'spec.ingressClassName',
    id: 'ingressClassName',
    header: memo(({ column }) => <HeaderAction column={column} name={'IngressClassName'} />),
    cell: memo(({ row }) => <div>{row.original.spec?.ingressClassName}</div>),
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
      const ingress = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Ingress');
      return (
        <Actions
          url={`/yaml/Ingress/${ingress.metadata?.name}/${ingress.metadata?.namespace}`}
          resource={ingress}
          name={'Ingress'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: ingress.metadata?.name,
              namespace: ingress?.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
