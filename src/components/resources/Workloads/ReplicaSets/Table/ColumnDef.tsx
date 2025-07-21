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
import { ReplicaSet } from '@/components/resources/Workloads/ReplicaSets/types';
import RsName from '@/components/resources/Workloads/ResourceName';

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

const columns: ColumnDef<ReplicaSet>[] = [
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
      return <RsName name={name} content={row.original.metadata.namespace} />;
    },
  },
  {
    accessorKey: 'spec.replicas',
    id: 'replicase',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Replicas
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.spec.replicas}/{row.original.status.readyReplicas}
        </div>
      );
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
      return <BlinkingCell value={age} isNew={ageSeconds < 60} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const rs = row.original;
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
              onClick={() => navigator.clipboard.writeText(rs.metadata.name)}
            >
              <ClipboardCopy size={8} />
              Copy name
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <Pencil size={8} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={rs.metadata?.deletionTimestamp !== undefined}
              className="text-xs"
              onClick={async () => {
                toast.promise(
                  invoke<ReplicaSet>('delete_replicaset', {
                    path: getKubeconfig(),
                    context: getCluster(),
                    rsNamespace: rs.metadata.namespace,
                    rsName: rs.metadata.name,
                  }),
                  {
                    loading: 'Deleting...',
                    success: () => {
                      return (
                        <span>
                          ReplicaSet <b>{rs.metadata.name}</b> deleted
                        </span>
                      );
                    },
                    error: (err) => (
                      <span>
                        Cant delete replicaset <b>{rs.metadata.name}</b>
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
