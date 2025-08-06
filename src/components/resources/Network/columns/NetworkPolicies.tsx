import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { NetworkPolicy } from 'kubernetes-models/networking.k8s.io/v1';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<NetworkPolicy>[] = [
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
    accessorKey: 'spec.policyTypes',
    id: 'PolicyType',
    header: memo(({ column }) => <HeaderAction column={column} name={'PolicyTypes'} />),
    cell: memo(({ row }) => <div>{row.original.spec.policyTypes}</div>),
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
      const np = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceNamespace: np.metadata.namespace,
        resourceName: np.metadata.name,
      };
      return (
        <Actions
          resource={np}
          name={'NetworkPolicy'}
          action={'delete_networkpolicy'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
