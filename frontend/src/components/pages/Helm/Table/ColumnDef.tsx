import { ColumnDef } from '@tanstack/react-table';
import AgeCell from '@/components/ui/Table/AgeCell';
import { HelmChart } from '@/types';

const columns: ColumnDef<HelmChart>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return <div>{(row.original as HelmChart).name}</div>;
    },
  },
  {
    accessorKey: 'namespace',
    id: 'namespace',
    header: 'Namespace',
    cell: ({ row }) => {
      return <div>{row.original.namespace}</div>;
    },
  },
  {
    accessorKey: 'info.status',
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <div>{(row.original as HelmChart).info.status}</div>;
    },
  },
  {
    accessorKey: 'chart.metadata.version',
    id: 'version',
    header: 'App Version',
    cell: ({ row }) => {
      return <div>{(row.original as HelmChart).chart.metadata.version}</div>;
    },
  },
  {
    accessorKey: 'version',
    id: 'revison',
    header: 'Revision',
    cell: ({ row }) => {
      return <div>{(row.original as HelmChart).version}</div>;
    },
  },
  {
    accessorKey: 'info.last_deployed',
    id: 'last_deployed',
    header: 'Last Deployed',
    cell: ({ row }) => {
      return <AgeCell age={(row.original as HelmChart).info.last_deployed} />;
    },
  },
];

export default columns;
