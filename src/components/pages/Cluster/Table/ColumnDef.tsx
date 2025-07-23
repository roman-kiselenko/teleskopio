import BlinkingCell from '@/components/ui/BlinkingCell';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { ColumnDef } from '@tanstack/react-table';
import { Node } from '@/components/pages/Cluster/types';
import { Badge } from '@/components/ui/badge';
import Actions from '@/components/resources/Table/Actions';
import { cn } from '@/util';

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

const columns: ColumnDef<Node>[] = [
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
      return <div>{name}</div>;
    },
  },
  {
    accessorFn: (row) => row.metadata?.labels,
    id: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const name = row.original.metadata.labels['node-role.kubernetes.io/control-plane'];
      return (
        <div>
          <Badge
            className="text-xs"
            variant={
              row.original.metadata.labels.hasOwnProperty('node-role.kubernetes.io/control-plane')
                ? 'destructive'
                : 'default'
            }
          >
            {row.original.metadata.labels.hasOwnProperty('node-role.kubernetes.io/control-plane')
              ? 'control plane'
              : 'worker'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'spec.podCIDR',
    id: 'podCIDR',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          PodCIDR
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.spec.podCIDR;
      return <div>{name}</div>;
    },
  },
  {
    accessorFn: (row) => row.status.addresses?.find((a) => a.type === 'InternalIP'),
    id: 'InternalIP',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          InternalIP
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const address = row.original.status.addresses?.find((a) => a.type === 'InternalIP');
      return <div>{address?.address}</div>;
    },
  },
  {
    accessorKey: 'status.nodeInfo.containerRuntimeVersion',
    id: 'containerRuntimeVersion',
    header: 'CRI',
    cell: ({ row }) => {
      const name = row.original.status.nodeInfo.containerRuntimeVersion;
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: 'status.nodeInfo.kubeletVersion',
    id: 'kubeletVersion',
    header: 'Kubelet',
    cell: ({ row }) => {
      const name = row.original.status.nodeInfo.kubeletVersion;
      return <div>{name}</div>;
    },
  },
  {
    id: 'kubeletReady',
    accessorFn: (row) => row.status?.conditions?.find((c) => c.reason === 'KubeletReady'),
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const ready = row.original.status?.conditions?.find((c) => c.reason === 'KubeletReady');
      return (
        <div
          className={cn(
            ready?.status !== 'True'
              ? 'text-red-400 animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
              : 'text-green-400',
            'flex flex-col',
          )}
        >
          <div className="w-full">{ready?.status !== 'True' ? 'NotReady' : 'Ready'}</div>
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
      return <BlinkingCell timestamp={getValue<string>()} value={age} isNew={ageSeconds < 60} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const node = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        nodeName: node.metadata.name,
      };
      return <Actions resource={node} name={'Node'} action={'delete_node'} payload={payload} />;
    },
  },
];

export default columns;
