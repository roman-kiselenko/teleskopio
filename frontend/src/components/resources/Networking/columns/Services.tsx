import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import JobName from '@/components/ui/Table/ResourceName';
import { Badge } from '@/components/ui/badge';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'spec.type',
    id: 'type',
    header: memo(({ column }) => <HeaderAction column={column} name={'Type'} />),
    cell: memo(({ row }) => {
      let color = '';
      if (row.original.spec?.type === 'LoadBalancer') {
        color = 'text-green-400';
      }
      return <div className={color}>{row.original.spec?.type}</div>;
    }),
  },
  {
    accessorKey: 'spec.clusterIP',
    id: 'clusterIP',
    header: memo(({ column }) => <HeaderAction column={column} name={'IP'} />),
    cell: memo(({ row }) => {
      let ip = row.original.spec?.clusterIP;
      if (row.original.spec?.type === 'LoadBalancer') {
        ip = row.original.status?.loadBalancer?.ingress?.[0]?.ip;
      }
      return <div>{ip}</div>;
    }),
  },
  {
    accessorKey: 'spec.ports',
    id: 'Ports',
    header: 'Ports',
    cell: memo(({ row }) => {
      const ports = row.original?.spec?.ports.map((p: any) => (
        <div>
          <Badge className="m-0.5">
            {p.protocol}({p.port}:{p.targetPort})
          </Badge>
        </div>
      ));
      return <div>{ports}</div>;
    }),
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
