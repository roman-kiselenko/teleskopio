import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/util';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    meta: { className: 'min-w-[30ch] max-w-[30ch]' },
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.name}</div>),
  },
  {
    accessorFn: (row) => row.metadata?.labels,
    id: 'role',
    header: 'Role',
    meta: { className: 'min-w-[15ch] max-w-[15ch]' },
    cell: ({ row }) => {
      const node = row.original.metadata;
      const controlPlane =
        node?.labels?.hasOwnProperty('node-role.kubernetes.io/control-plane') ||
        node?.labels?.hasOwnProperty('node-role.kubernetes.io/controlplane');
      return (
        <div>
          <Badge className="text-xs" variant={controlPlane ? 'destructive' : 'default'}>
            {controlPlane ? 'control plane' : 'worker'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'spec.podCIDR',
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    id: 'podCIDR',
    header: memo(({ column }) => <HeaderAction column={column} name={'PodCIDR'} />),
    cell: memo(({ row }) => <div>{row.original.spec?.podCIDR}</div>),
  },
  {
    accessorFn: (row) => row.status?.addresses?.find((a) => a.type === 'InternalIP'),
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    id: 'InternalIP',
    header: memo(({ column }) => <HeaderAction column={column} name={'InternalIP'} />),
    cell: ({ row }) => {
      const address = row.original.status?.addresses?.find((a) => a.type === 'InternalIP');
      return <div>{address?.address}</div>;
    },
  },
  {
    accessorKey: 'status.nodeInfo.kubeletVersion',
    id: 'kubeletVersion',
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    header: 'Kubelet',
    cell: ({ row }) => {
      const name = row.original.status?.nodeInfo?.kubeletVersion;
      return (
        <div className="flex flex-row items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{name}</div>
            </TooltipTrigger>
            <TooltipContent>
              CRI {row.original.status?.nodeInfo?.containerRuntimeVersion}
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    id: 'kubeletReady',
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    accessorFn: (row) => row.status?.conditions?.find((c) => c.reason === 'KubeletReady'),
    header: memo(({ column }) => <HeaderAction column={column} name={'Status'} />),
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
    id: 'age',
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
