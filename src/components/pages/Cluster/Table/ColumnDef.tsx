import AgeCell from '@/components/ui/AgeCell';
import { ArrowUpDown, CirclePause, CirclePlay, BrushCleaning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { ColumnDef } from '@tanstack/react-table';
import { Node } from '@/components/pages/Cluster/types';
import { Badge } from '@/components/ui/badge';
import Actions from '@/components/resources/Table/Actions';
import { cn } from '@/util';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    accessorKey: 'status.nodeInfo.kubeletVersion',
    id: 'kubeletVersion',
    header: 'Kubelet',
    cell: ({ row }) => {
      const name = row.original.status.nodeInfo.kubeletVersion;
      return (
        <div className="flex flex-row items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{name}</div>
            </TooltipTrigger>
            <TooltipContent>
              CRI {row.original.status.nodeInfo.containerRuntimeVersion}
            </TooltipContent>
          </Tooltip>
        </div>
      );
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
      const cordoned = row.original.spec?.taints?.find(
        (t) => t.effect === 'NoSchedule' && t.key === 'node.kubernetes.io/unschedulable',
      );
      const ready = row.original.status?.conditions?.find((c) => c.reason === 'KubeletReady');
      return (
        <div className="flex flex-row">
          <div
            className={cn(
              ready?.status !== 'True'
                ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
                : '',
              'flex flex-row',
              `${ready?.status !== 'True' ? 'text-red-400' : 'text-green-400'}`,
            )}
          >
            {ready?.status !== 'True' ? 'NotReady' : 'Ready'}
          </div>
          <div className={`${cordoned ? 'ml-1 text-orange-400' : ''}`}>
            {cordoned ? 'NoSchedule' : ''}
          </div>
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
      return <AgeCell age={getValue<string>()} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const node = row.original;
      const cordoned = node.spec?.taints?.find(
        (t) => t.effect === 'NoSchedule' && t.key === 'node.kubernetes.io/unschedulable',
      );
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        nodeName: node.metadata.name,
      };
      const additional = [
        <DropdownMenuItem
          key={node.metadata.uid}
          className="text-xs"
          onClick={async () => {
            toast.promise(
              invoke<any>(`${cordoned ? 'uncordon' : 'cordon'}_node`, {
                path: getKubeconfig(),
                context: getCluster(),
                nodeName: node.metadata.name,
              }),
              {
                loading: `${cordoned ? 'Uncordoning' : 'Cordoning'}...`,
                success: () => {
                  return (
                    <span>
                      Node <b>{node.metadata.name}</b> {cordoned ? 'uncordoned' : 'cordoned'}
                    </span>
                  );
                },
                error: (err) => (
                  <span>
                    Cant {cordoned ? 'uncordon' : 'cordon'} <b>{node.metadata.name}</b>
                    <br />
                    {err.message}
                  </span>
                ),
              },
            );
          }}
        >
          {cordoned ? (
            <div className="flex flex-row items-center">
              <div>
                <CirclePause className="mr-2" />
              </div>
              <div>Uncordon</div>
            </div>
          ) : (
            <div className="flex flex-row items-center">
              <div>
                <CirclePlay className="mr-2" />
              </div>
              <div>Cordon</div>
            </div>
          )}
        </DropdownMenuItem>,
        <DropdownMenuItem key={node.metadata.uid} className="text-xs">
          <BrushCleaning />
          Drain
        </DropdownMenuItem>,
      ];
      return (
        <Actions
          children={additional}
          resource={node}
          name={'Node'}
          action={'delete_node'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
