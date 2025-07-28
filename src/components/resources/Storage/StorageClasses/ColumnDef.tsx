import AgeCell from '@/components/ui/AgeCell';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getKubeconfig, getCluster } from '@/store/cluster';
import moment from 'moment';
import { ColumnDef } from '@tanstack/react-table';
import { StorageClass } from '@/components/resources/Storage/StorageClasses/types';
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

const columns: ColumnDef<StorageClass>[] = [
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
    accessorKey: 'provisioner',
    id: 'provisioner',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Provisioner
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.provisioner;
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: 'reclaimPolicy',
    id: 'reclaimPolicy',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ReclaimPolicy
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.reclaimPolicy;
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: 'volumeBindingMode',
    id: 'volumeBindingMode',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          VolumeBindingMode
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.volumeBindingMode;
      return <div>{name}</div>;
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
      const sc = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        scName: sc.metadata.name,
      };
      return (
        <Actions
          resource={sc}
          name={'StorageClass'}
          action={'delete_storageclass'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
