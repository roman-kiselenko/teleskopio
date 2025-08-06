import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ServiceAccount } from 'kubernetes-models/v1';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<ServiceAccount>[] = [
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
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceName: sa.metadata?.name,
        resourceNamespace: sa.metadata?.namespace,
      };
      return (
        <Actions
          url={`/serviceaccounts/${sa.metadata?.namespace}/${sa?.metadata?.name}`}
          resource={sa}
          name={'ServiceAccount'}
          action={'delete_serviceaccount'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
