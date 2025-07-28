import AgeCell from '@/components/ui/AgeCell';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getKubeconfig, getCluster } from '@/store/cluster';
import moment from 'moment';
import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/components/resources/Network/Services/types';
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

const columns: ColumnDef<Service>[] = [
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
    accessorKey: 'spec.type',
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
      const t = row.original.spec.type;
      return <div>{t}</div>;
    },
  },
  {
    accessorKey: 'spec.clusterIP',
    id: 'clusterIP',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ClusterIP
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const t = row.original.spec.clusterIP;
      return <div>{t}</div>;
    },
  },
  {
    accessorKey: 'spec.internalTrafficPolicy',
    id: 'internalTrafficPolicy',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          InternalTrafficPolicy
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const t = row.original.spec.internalTrafficPolicy;
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
      const age = moment(getValue<string>()).fromNow();
      return <AgeCell age={age} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const service = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        serviceNamespace: service.metadata.namespace,
        serviceName: service.metadata.name,
      };
      return (
        <Actions resource={service} name={'Service'} action={'delete_service'} payload={payload} />
      );
    },
  },
];

export default columns;
