import { MoreHorizontal, ArrowUpDown, ClipboardCopy, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlinkingCell from '@/components/ui/BlinkingCell';
import { invoke } from '@tauri-apps/api/core';
import { getKubeconfig, getCluster } from '@/store/cluster';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import moment from 'moment';
import { ColumnDef } from '@tanstack/react-table';
import { Secret } from '@/components/resources/Configs/Secrets/types';
import JobName from '@/components/resources/Workloads/ResourceName';

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
      const age = moment(getValue<string>()).fromNow();
      const ageSeconds = moment().diff(getValue<string>(), 'seconds');
      return <BlinkingCell timestamp={getValue<string>()} value={age} isNew={ageSeconds < 60} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const secret = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="text-xs sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-xs"
              onClick={() => navigator.clipboard.writeText(secret.metadata.name)}
            >
              <ClipboardCopy size={8} />
              Copy name
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <Pencil size={8} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={secret.metadata?.deletionTimestamp !== undefined}
              className="text-xs"
              onClick={async () => {
                toast.promise(
                  invoke<Secret>('delete_secret', {
                    path: getKubeconfig(),
                    context: getCluster(),
                    secretNamespace: secret.metadata.namespace,
                    secretName: secret.metadata.name,
                  }),
                  {
                    loading: 'Deleting...',
                    success: () => {
                      return (
                        <span>
                          Secret <b>{secret.metadata.name}</b> deleted
                        </span>
                      );
                    },
                    error: (err) => (
                      <span>
                        Cant delete secret <b>{secret.metadata.name}</b>
                        <br />
                        {err.message}
                      </span>
                    ),
                  },
                );
              }}
            >
              {' '}
              <Trash size={8} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default columns;
