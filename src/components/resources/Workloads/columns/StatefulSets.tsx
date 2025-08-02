import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { StatefulSet } from '@/types';
import SsName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<StatefulSet>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <SsName name={row.original.metadata.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata.namespace}</div>),
  },
  {
    accessorKey: 'replicas',
    id: 'replicas',
    header: memo(({ column }) => <HeaderAction column={column} name={'Replicas'} />),
    cell: ({ row }) => {
      const currentReplicas = row.original.status.currentReplicas;
      const availableReplicas = row.original.status.availableReplicas;
      return (
        <div>
          {currentReplicas}/{availableReplicas}
        </div>
      );
    },
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ss = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceNamespace: ss.metadata.namespace,
        resourceName: ss.metadata.name,
      };
      return (
        <Actions
          resource={ss}
          name={'StatefulSet'}
          action={'delete_statefulset'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
