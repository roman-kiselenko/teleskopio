import { MoreHorizontal } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlinkingCell from '@/components/resources/Workloads/Pods/Table/BlinkingCell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  //   DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import moment from 'moment';
import { ColumnDef } from '@tanstack/react-table';
// import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

type Container = {
  name: string;
  image: string;
};

type ContainerStatus = {
  name: string;
  image: string;
  started: Boolean;
};

type Pod = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
  };
  spec: {
    containers: Container[];
  };
  status: {
    containerStatuses: ContainerStatus[];
    hostIP: string;
    phase: string;
  };
};

const columns: ColumnDef<Pod>[] = [
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
      //   const containers = `${row.original.spec.containers.length}/${row.original.status.containerStatuses.filter((c) => c.started).length}`;
      const name = row.original.metadata.name;
      return <div className={`font-medium`}>{name}</div>;
    },
  },
  {
    accessorKey: 'metadata.namespace',
    header: 'Namespace',
    id: 'namespace',
  },
  {
    accessorKey: 'spec.nodeName',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Node
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },

  {
    accessorKey: 'status.phase',
    id: 'phase',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Phase
          <ArrowUpDown className="h-2 w-2" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const phase = getValue<string>();
      let color = 'text-green-300';
      if (phase === 'Failed') {
        color = 'text-red-300';
      } else if (phase === 'Pending') {
        color = 'text-orange-300';
      }
      return <div className={`font-medium ${color}`}>{phase}</div>;
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
      const pod = row.original;
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
              onClick={() => navigator.clipboard.writeText(pod.metadata.name)}
            >
              Copy name
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Delete</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Logs</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Attach</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default columns;
