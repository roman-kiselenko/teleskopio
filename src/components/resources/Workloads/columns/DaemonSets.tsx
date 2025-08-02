import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DaemonSet } from '@/types';
import DsName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<DaemonSet>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <DsName name={row.original.metadata.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata.namespace}</div>),
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
      const ds = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceNamespace: ds.metadata.namespace,
        resourceName: ds.metadata.name,
      };
      return (
        <Actions resource={ds} name={'DaemonSet'} action={'delete_daemonset'} payload={payload} />
      );
    },
  },
];

export default columns;
