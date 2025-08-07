import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import RsName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/api-resources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <RsName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'spec.replicas',
    id: 'replicase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Replicas'} />),
    cell: ({ row }) => {
      return (
        <div>
          {row.original.spec?.replicas}/{row.original.status?.readyReplicas}
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
      const rs = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'ReplicaSet');
      let request = {
        name: rs.metadata?.name,
        namespace: rs?.metadata?.namespace,
        ...resource,
      };
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        request,
      };
      return (
        <Actions
          url={`/yaml/ReplicaSet/${rs.metadata?.name}/${rs?.metadata?.namespace}`}
          resource={rs}
          name={'ReplicaSet'}
          action={'delete_dynamic_resource'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
