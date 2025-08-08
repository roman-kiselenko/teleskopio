import {
  MoreHorizontal,
  Trash,
  ClipboardCopy,
  HandHelping,
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
import { call } from '@/lib/api';
import { toast } from 'sonner';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/api-resources';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const columns: ColumnDef<any>[] = [
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
        containers = containers.concat(
          pod.status.initContainerStatuses.map((c) => {
            return { ...c, containerType: 'Init' };
          }),
        );
      }
      if (pod.status?.ephemeralContainerStatuses) {
        containers = containers.concat(
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
      const [openDialog, setOpenDialog] = useState(false);
      const pod = row.original;
      const actionDisabled = pod?.metadata?.deletionTimestamp ? true : false;
      let navigate = useNavigate();
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Pod');
      let request = {
        name: pod.metadata?.name,
        namespace: pod?.metadata?.namespace,
        ...resource,
      };
      const owner = pod?.metadata?.ownerReferences[0];
      return (
        <div>
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
                onClick={() =>
                  navigate(`/yaml/Pod/${pod?.metadata?.name}/${pod?.metadata?.namespace}`)
                }
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
                onClick={() => setOpenDialog(true)}
              >
                {' '}
                <Trash size={8} color="red" /> <span className="text-red-500">Delete</span>
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
              <DropdownMenuItem
                disabled={owner === undefined}
                onClick={() => {
                  navigate(`/yaml/${owner.kind}/${owner.name}/${pod?.metadata?.namespace}`);
                }}
                className="text-xs"
              >
                <HandHelping />
                Owner
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-xs">
                <SquareTerminal />
                Attach
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xs">Are you sure?</DialogTitle>
              </DialogHeader>
              <p className="text-xs">
                This operation cant be undone!
                <br />
                {pod.kind} <span className="text-red-600">{pod.metadata.name}</span> will be
                deleted.
              </p>
              <div className="flex justify-end gap-2">
                <Button className="text-xs" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="text-xs"
                  variant="destructive"
                  onClick={() => {
                    toast.promise(call('delete_dynamic_resource', { request: request }), {
                      loading: 'Deleting...',
                      success: () => {
                        return (
                          <span>
                            Terminating Pod <b>{pod.metadata.name}</b>
                          </span>
                        );
                      },
                      error: (err) => (
                        <span>
                          Cant delete Pod <b>{pod.metadata.name}</b>
                          <br />
                          {err.message}
                        </span>
                      ),
                    });
                    setOpenDialog(false);
                  }}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }),
  },
];

export default columns;
