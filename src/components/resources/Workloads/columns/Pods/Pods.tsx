import {
  MoreHorizontal,
  Trash,
  ClipboardCopy,
  ScrollText,
  SquareTerminal,
  SquareMousePointer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgeCell from '@/components/ui/Table/AgeCell';
import ContainerIcon from '@/components/resources/Workloads/columns/Pods/ContainerIcon';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import PodName from '@/components/ui/Table/ResourceName';
import PodStatus from '@/components/resources/Workloads/columns/Pods/PodStatus';
import { invoke } from '@tauri-apps/api/core';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { toast } from 'sonner';
import { memo } from 'react';
import { useNavigate } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Pod } from 'kubernetes-models/v1';

const columns: ColumnDef<Pod>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <PodName name={row?.original?.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row?.original?.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'spec.nodeName',
    id: 'nodename',
    header: memo(({ column }) => <HeaderAction column={column} name={'Node'} />),
    cell: memo(({ row }) => <div>{row?.original?.spec?.nodeName}</div>),
  },
  {
    accessorKey: 'containers',
    header: 'Containers',
    id: 'containers',
    cell: memo(({ row }) => {
      const pod = row.original;
      let containers = pod.status?.containerStatuses ? pod.status?.containerStatuses : [];
      if (pod.status?.initContainerStatuses) {
        containers.concat(
          pod.status.initContainerStatuses.map((c) => {
            return { ...c, containerType: 'Init' };
          }),
        );
      }
      if (pod.status?.ephemeralContainerStatuses) {
        containers.concat(
          pod.status.ephemeralContainerStatuses.map((c) => {
            return { ...c, containerType: 'Ephemeral' };
          }),
        );
      }
      return (
        <div className="flex flex-wrap w-30">
          {containers.map((c: any) => (
            <ContainerIcon key={c.name} container={c} />
          ))}
        </div>
      );
    }),
  },
  {
    accessorFn: (row) => row?.status?.podIP ?? '',
    id: 'pod_ip',
    header: memo(({ column }) => <HeaderAction column={column} name={'PodIP'} />),
    cell: memo(({ row }) => <div>{row?.original?.status?.podIP}</div>),
  },
  {
    accessorKey: 'status.phase',
    id: 'phase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Status'} />),
    cell: memo(({ row }) => <PodStatus pod={row.original} />),
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: memo(({ row }) => {
      const pod = row.original;
      const actionDisabled = pod?.metadata?.deletionTimestamp ? true : false;
      let navigate = useNavigate();
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
              onClick={() => navigate(`/pods/${pod?.metadata?.namespace}/${pod?.metadata?.name}`)}
            >
              <SquareMousePointer size={8} />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onClick={() => navigator.clipboard.writeText(pod?.metadata?.name as string)}
            >
              <ClipboardCopy size={8} />
              Copy name
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={actionDisabled}
              className="text-xs"
              onClick={async () => {
                toast.promise(
                  invoke<Pod>('delete_pod', {
                    path: getKubeconfig(),
                    context: getCluster(),
                    resourceNamespace: pod?.metadata?.namespace,
                    resourceName: pod?.metadata?.name,
                  }),
                  {
                    loading: 'Deleting...',
                    success: () => {
                      return (
                        <span>
                          Terminating Pod <b>{pod?.metadata?.name}</b>
                        </span>
                      );
                    },
                    error: (err) => (
                      <span>
                        Cant delete pod <b>{pod?.metadata?.name}</b>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate(`/pods/logs/${pod?.metadata?.namespace}/${pod?.metadata?.name}`)
              }
              disabled={actionDisabled}
              className="text-xs"
            >
              <ScrollText />
              Logs
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-xs">
              <SquareTerminal />
              Attach
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }),
  },
];

export default columns;
