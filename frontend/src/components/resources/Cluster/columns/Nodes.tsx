import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { CirclePause, CirclePlay } from 'lucide-react';
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
import { apiResourcesState } from '@/store/apiResources';

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
  {
    id: 'actions',
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    cell: ({ row }) => {
      const node = row.original;
      const cordoned = node.spec?.taints?.find(
        (t) => t.effect === 'NoSchedule' && t.key === 'node.kubernetes.io/unschedulable',
      );
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Node');
      let request = {
        cordon: cordoned ? false : true,
        name: node.metadata?.name,
        ...resource,
      };
      const additional = (
        <div>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => {
              call(`${cordoned ? 'uncordon' : 'cordon'}_node`, {
                ...request,
                resourceName: node.metadata?.name,
              })
                .then((data) => {
                  if (data.message) {
                    toast.error(
                      <span>
                        Cant {cordoned ? 'uncordone' : 'cordone'} Node <b>{node.metadata?.name}</b>
                        <br />
                        {data.message}
                      </span>,
                    );
                  } else {
                    toast.info(
                      <span>
                        Node <b>{node.metadata?.name}</b> {cordoned ? 'uncordoned' : 'cordoned'}
                      </span>,
                    );
                  }
                })
                .catch((reason) => {
                  toast.error(
                    <span>
                      Cant {cordoned ? 'uncordon' : 'cordon'} <b>{node.metadata?.name}</b>
                      <br />
                      {reason.message}
                    </span>,
                  );
                });
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
        </div>
      );
      return (
        <Actions
          url={`/yaml/Node/${node.metadata?.name}/${node.metadata?.namespace}?group=`}
          children={additional}
          resource={node}
          name={'Node'}
          drain={true}
          action={'delete_dynamic_resource'}
          request={{ request: request }}
        />
      );
    },
  },
];

export default columns;
