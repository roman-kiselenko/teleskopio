import AgeCell from '@/components/ui/AgeCell';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getKubeconfig, getCluster } from '@/store/cluster';
import moment from 'moment';
import { ColumnDef } from '@tanstack/react-table';
import { Secret } from '@/components/resources/Configs/Secrets/types';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s',
    s: '%ds',
    ss: '%ds',
    m: '%dm',
    mm: '%dm',
    h: '%dh',
    hh: '%dh',
    d: '%dd',
    dd: '%dd',
    w: '%dw',
    ww: '%dw',
    M: '%dmn',
    MM: '%dmn',
    y: '%dy',
    yy: '%dy',
  },
});

const columns: ColumnDef<Secret>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.metadata.name;
      return <JobName name={name} content={row.original.metadata.namespace} />;
    },
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Namespace
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.metadata.namespace;
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: 'type',
    id: 'type',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const t = row.original.type;
      return <div>{t}</div>;
    },
  },
  {
    id: 'creationTimestamp',
    accessorFn: (row) => row.metadata?.creationTimestamp,
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Age
          <ArrowUpDown className="h-2 w-2" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      return <AgeCell age={getValue<string>()} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const secret = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        secretNamespace: secret.metadata.namespace,
        secretName: secret.metadata.name,
      };
      return (
        <Actions resource={secret} name={'Secret'} action={'delete_secret'} payload={payload} />
      );
    },
  },
];

export default columns;
