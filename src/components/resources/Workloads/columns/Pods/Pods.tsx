import {
  MoreHorizontal,
  Trash,
  Pencil,
  ClipboardCopy,
  ScrollText,
  SquareTerminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgeCell from '@/components/ui/AgeCell';
import ContainerIcon from '@/components/resources/Workloads/columns/Pods/ContainerIcon';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import PodName from '@/components/ui/Table/ResourceName';
import PodStatus from '@/components/resources/Workloads/columns/Pods/PodStatus';
import { invoke } from '@tauri-apps/api/core';
import { getKubeconfig, getCluster } from '@/store/cluster';
import toast from 'react-hot-toast';
import { memo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Pod } from '@/types';

const columns: ColumnDef<Pod>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <PodName name={row.original.name} />),
  },
  {
    accessorKey: 'namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.namespace}</div>),
  },
  {
    accessorKey: 'node_name',
    id: 'nodename',
    header: memo(({ column }) => <HeaderAction column={column} name={'Node'} />),
    cell: memo(({ row }) => <div>{row.original.node_name}</div>),
  },
  {
    accessorKey: 'containers',
    header: 'Containers',
    id: 'containers',
    cell: memo(({ row }) => {
      const pod = row.original;
      return (
        <div className="flex flex-wrap w-30">
          {pod?.containers.map((c: any) => (
            <ContainerIcon key={c.name} container={c} />
          ))}
        </div>
      );
    }),
  },
  {
    accessorFn: (row) => row.pod_ip ?? '',
    id: 'pod_ip',
    header: memo(({ column }) => <HeaderAction column={column} name={'PodIP'} />),
    cell: memo(({ row }) => <div>{row.original.pod_ip}</div>),
  },
  {
    accessorKey: 'phase',
    id: 'phase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Status'} />),
    cell: memo(({ row }) => <PodStatus pod={row.original} />),
  },
  {
    id: 'age',
    accessorFn: (row) => row?.creation_timestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: memo(({ row }) => {
      const pod = row.original;
      const actionDisabled = pod?.is_terminating;
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
              onClick={() => navigator.clipboard.writeText(pod.name)}
            >
              <ClipboardCopy size={8} />
              Copy name
            </DropdownMenuItem>
            <DropdownMenuItem disabled={actionDisabled} className="text-xs">
              <Pencil size={8} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={actionDisabled}
              className="text-xs"
              onClick={async () => {
                toast.promise(
                  invoke<Pod>('delete_pod', {
                    path: getKubeconfig(),
                    context: getCluster(),
                    podNamespace: pod.namespace,
                    podName: pod.name,
                  }),
                  {
                    loading: 'Deleting...',
                    success: () => {
                      return (
                        <span>
                          Terminating Pod <b>{pod.name}</b>
                        </span>
                      );
                    },
                    error: (err) => (
                      <span>
                        Cant delete pod <b>{pod.name}</b>
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
            <DropdownMenuItem disabled={actionDisabled} className="text-xs">
              <ScrollText />
              Logs
            </DropdownMenuItem>
            <DropdownMenuItem disabled={actionDisabled} className="text-xs">
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
