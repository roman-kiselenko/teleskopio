import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Namespace } from 'kubernetes-models/v1';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<Namespace>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.name}</div>),
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
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceName: ns.metadata?.name,
      };
      return (
        <Actions
          url={`/namespaces/${ns?.metadata?.name}`}
          resource={ns}
          name={'Namespace'}
          action={'delete_namespace'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
