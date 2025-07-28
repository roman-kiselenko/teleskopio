import AgeCell from '@/components/ui/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DaemonSet } from '@/types';
import DsName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<DaemonSet>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <DsName name={row.original.name} />),
  },
  {
    accessorKey: 'namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.namespace}</div>),
  },
  {
    id: 'age',
    accessorFn: (row) => row?.creation_timestamp,
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
        dsNamespace: ds.metadata.namespace,
        dsName: ds.metadata.name,
      };
      return (
        <Actions resource={ds} name={'DaemonSet'} action={'delete_daemonset'} payload={payload} />
      );
    },
  },
];

export default columns;
