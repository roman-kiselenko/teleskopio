import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ConfigMap } from '@/types';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<ConfigMap>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata.namespace}</div>),
  },
  {
    id: 'creationTimestamp',
    accessorFn: (row) => row.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const cm = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceNamespace: cm.metadata.namespace,
        resourceName: cm.metadata.name,
      };
      return (
        <Actions resource={cm} name={'ConfigMap'} action={'delete_configmap'} payload={payload} />
      );
    },
  },
];

export default columns;
