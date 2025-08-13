import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';
import { Badge } from '@/components/ui/badge';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'spec.type',
    id: 'type',
    header: memo(({ column }) => <HeaderAction column={column} name={'Type'} />),
    cell: memo(({ row }) => <div>{row.original.spec?.type}</div>),
  },
  {
    accessorKey: 'spec.clusterIP',
    id: 'clusterIP',
    header: memo(({ column }) => <HeaderAction column={column} name={'ClusterIP'} />),
    cell: memo(({ row }) => <div>{row.original.spec?.clusterIP}</div>),
  },
  {
    accessorKey: 'spec.selector',
    id: 'Selector',
    header: 'Selector',
    cell: memo(({ row }) => {
      return <div>{JSON.stringify(row.original.spec?.selector)}</div>;
    }),
  },
  {
    accessorKey: 'spec.ports',
    id: 'Ports',
    header: 'Ports',
    cell: memo(({ row }) => {
      const ports = row.original?.spec?.ports.map((p: any) => (
        <div>
          <Badge className="m-0.5">
            {p.protocol}({p.port}:{p.targetPort})
          </Badge>
        </div>
      ));
      return <div>{ports}</div>;
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
      const service = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Service');
      return (
        <Actions
          url={`/yaml/Service/${service.metadata?.name}/${service.metadata?.namespace}`}
          resource={service}
          name={'Service'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: service.metadata?.name,
              namespace: service?.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
