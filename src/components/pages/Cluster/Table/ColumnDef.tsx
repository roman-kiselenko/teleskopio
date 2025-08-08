import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { CirclePause, CirclePlay, BrushCleaning } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import Actions from '@/components/ui/Table/Actions';
import { cn } from '@/util';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { memo } from 'react';
import { call } from '@/lib/api';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/api-resources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.name}</div>),
  },
  {
    accessorFn: (row) => row.metadata?.labels,
    id: 'role',
    header: 'Role',
    cell: ({ row }) => {
      return (
        <div>
          <Badge
            className="text-xs"
            variant={
              row.original.metadata?.labels?.hasOwnProperty('node-role.kubernetes.io/control-plane')
                ? 'destructive'
                : 'default'
            }
          >
            {row.original.metadata?.labels?.hasOwnProperty('node-role.kubernetes.io/control-plane')
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
    header: memo(({ column }) => <HeaderAction column={column} name={'PodCIDR'} />),
    cell: memo(({ row }) => <div>{row.original.spec?.podCIDR}</div>),
  },
  {
    accessorFn: (row) => row.status?.addresses?.find((a) => a.type === 'InternalIP'),
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
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const node = row.original;
      const cordoned = node.spec?.taints?.find(
        (t) => t.effect === 'NoSchedule' && t.key === 'node.kubernetes.io/unschedulable',
      );
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Node');
      let request = {
        name: node.metadata?.name,
        ...resource,
      };
      const additional = (
        <div>
          <DropdownMenuItem
            key={node.metadata?.uid}
            className="text-xs"
            onClick={async () => {
              toast.promise(
                call(`${cordoned ? 'uncordon' : 'cordon'}_node`, {
                  ...request,
                  resourceName: node.metadata?.name,
                }),
                {
                  loading: `${cordoned ? 'Uncordoning' : 'Cordoning'}...`,
                  success: () => {
                    return (
                      <span>
                        Node <b>{node.metadata?.name}</b> {cordoned ? 'uncordoned' : 'cordoned'}
                      </span>
                    );
                  },
                  error: (err) => (
                    <span>
                      Cant {cordoned ? 'uncordon' : 'cordon'} <b>{node.metadata?.name}</b>
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
          </DropdownMenuItem>
          <DropdownMenuItem
            key={node.metadata?.uid}
            className="text-xs"
            onClick={async () => {
              toast.promise(call('drain_node', { resourceName: node.metadata?.name }), {
                loading: 'Draining...',
                success: () => {
                  return (
                    <span>
                      Node <b>{node.metadata?.name}</b> drained
                    </span>
                  );
                },
                error: (err) => (
                  <span>
                    Cant drain <b>{node.metadata?.name}</b>
                    <br />
                    {err.message}
                  </span>
                ),
              });
            }}
          >
            <BrushCleaning />
            Drain
          </DropdownMenuItem>
        </div>
      );
      return (
        <Actions
          url={`/cluster/nodes/${node.metadata?.name}`}
          children={additional}
          resource={node}
          name={'Node'}
          action={'delete_dynamic_resource'}
          request={{ request: request }}
        />
      );
    },
  },
];

export default columns;
