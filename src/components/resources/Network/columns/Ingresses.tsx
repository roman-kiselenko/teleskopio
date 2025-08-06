import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Ingress } from 'kubernetes-models/networking.k8s.io/v1';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<Ingress>[] = [
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
    accessorKey: 'spec.ingressClassName',
    id: 'ingressClassName',
    header: memo(({ column }) => <HeaderAction column={column} name={'IngressClassName'} />),
    cell: memo(({ row }) => <div>{row.original.spec?.ingressClassName}</div>),
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
      const ingress = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceNamespace: ingress.metadata?.namespace,
        resourceName: ingress.metadata?.name,
      };
      return (
        <Actions
          url={`/ingresses/${ingress.metadata?.namespace}/${ingress?.metadata?.name}`}
          resource={ingress}
          name={'Ingress'}
          action={'delete_ingress'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
