import { MoreHorizontal, ArrowUpDown, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlinkingCell from '@/components/resources/Workloads/Pods/Table/BlinkingCell';
import ContainerIcon from '@/components/resources/Workloads/Pods/Table/ContainerIcon';
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
    deletionTimestamp: string;
  };
  spec: {
    containers: Container[];
  };
  status: {
    containerStatuses: ContainerStatus[];
    hostIP: string;
    podIP: string;
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
      const name = row.original.metadata.name;
      return <div className={`font-medium`}>{name}</div>;
    },
  },
  {
    accessorKey: 'metadata.namespace',
    header: 'Containers',
    id: 'containers',
    cell: ({ row }) => {
      const pod = row.original;
      return (
        <div className="flex flex-wrap w-24">
          {pod.status.containerStatuses.map((c: any, index: number) => {
            return (
              <ContainerIcon
                containerstate={c.state}
                name={c.name}
                key={index}
                ready={c.ready && c.started}
              />
            );
          })}
        </div>
      );
    },
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
    accessorFn: (row) => row.status?.podIP ?? '',
    id: 'podIP',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          podIP
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
          Status
          <ArrowUpDown size={32} className="h-12 w-12" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const pod = row.original;
      let phase = pod.status.phase;
      let color = 'text-green-500';
      if (pod.metadata?.deletionTimestamp) {
        phase = 'Terminating';
        color = 'text-gray-300';
      }
      if (phase === 'Failed') {
        color = 'text-red-500';
      } else if (phase === 'Pending') {
        color = 'text-gray-500';
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
