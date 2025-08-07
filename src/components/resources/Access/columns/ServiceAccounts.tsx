import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
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
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
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
      const sa = row.original;
      const resource = apiResourcesState
        .get()
        .find((r: ApiResource) => r.kind === 'ServiceAccount');
      let request = {
        name: sa.metadata?.name,
        namespace: sa?.metadata?.namespace,
        ...resource,
      };
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        request,
      };
      return (
        <Actions
          url={`/yaml/ServiceAccount/${sa.metadata?.name}/${sa.metadata?.namespace}`}
          resource={sa}
          name={'ServiceAccount'}
          action={'delete_dynamic_resource'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
