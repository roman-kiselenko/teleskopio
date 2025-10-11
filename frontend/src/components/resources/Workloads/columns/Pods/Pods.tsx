import {
  MoreHorizontal,
  Trash,
  ClipboardCopy,
  HandHelping,
  ScrollText,
  SquareMousePointer,
  Rss,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgeCell from '@/components/ui/Table/AgeCell';
import ContainerIcon from '@/components/resources/Workloads/columns/Pods/ContainerIcon';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import PodName from '@/components/resources/Workloads/columns/Pods/PodName';
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
import { apiResourcesState } from '@/store/apiResources';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    meta: { className: 'min-w-[35ch] max-w-[35ch] truncate' },
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <PodName pod={row?.original} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row?.original?.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'containers',
    meta: { className: 'min-w-[20ch] max-w-[20ch]' },
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
    meta: { className: 'min-w-[15ch] max-w-[15ch]' },
    id: 'pod_ip',
    header: memo(({ column }) => <HeaderAction column={column} name={'PodIP'} />),
    cell: memo(({ row }) => <div>{row?.original?.status?.podIP}</div>),
  },
  {
    accessorFn: (row) => row?.status?.qosClass ?? '',
    id: 'qos',
    meta: { className: 'min-w-[15ch] max-w-[15ch]' },
    header: memo(({ column }) => <HeaderAction column={column} name={'QOS'} />),
    cell: memo(({ row }) => <div>{row?.original?.status?.qosClass}</div>),
  },
  {
    accessorKey: 'status.phase',
    meta: { className: 'min-w-[15ch] max-w-[15ch]' },
    id: 'phase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Status'} />),
    cell: memo(({ row }) => <PodStatus pod={row.original} />),
  },
  {
    id: 'age',
    meta: { className: 'min-w-[7ch] max-w-[7ch]' },
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    meta: { className: 'min-w-[7ch] max-w-[7ch]' },
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
      const owner =
        pod?.metadata?.ownerReferences?.length > 0 ? pod?.metadata?.ownerReferences[0] : undefined;
      return (
        <div className="flex flex-row justify-center w-full">
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
                  navigate(`/yaml/Pod/${pod?.metadata?.name}/${pod?.metadata?.namespace}?group=`)
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
              <DropdownMenuItem
                key="dm4"
                className="text-xs"
                onClick={() =>
                  navigate(
                    `/resource/ResourceEvents/${pod.kind}/${pod?.metadata?.uid}/${pod?.metadata?.namespace}/${pod?.metadata.name}`,
                  )
                }
              >
                <div className="flex flex-row">
                  <Rss size={8} /> <span className="ml-2">Events</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/resource/Logs/${pod?.metadata?.namespace}/${pod?.metadata?.name}`)
                }
                disabled={actionDisabled || pod?.status?.phase === 'Pending'}
                className="text-xs"
              >
                <ScrollText />
                Logs
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={owner === undefined}
                onClick={() => {
                  navigate(
                    `/yaml/${owner.kind}/${owner.name}/${pod?.metadata?.namespace}?group=${owner.apiVersion.split('/')[0]}`,
                  );
                }}
                className="text-xs"
              >
                <HandHelping />
                Owner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xs"></DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <span className="text-xs text-red-600 font-bold">
                This operation can't be undone!
              </span>
              <p className="text-xs">
                Delete <span className="underline">{pod.kind}</span> resource
                <br />
                Name: <span className="font-bold">{pod.metadata.name}</span>
                <br />
                {pod.metadata?.namespace ? (
                  <span>
                    {' '}
                    Namespace: <span className="font-bold">{pod.metadata.namespace}</span>
                  </span>
                ) : (
                  <></>
                )}
              </p>
              <div className="flex justify-end gap-2">
                <Button className="text-xs" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="text-xs"
                  variant="destructive"
                  onClick={() => {
                    call('delete_dynamic_resource', { request: request })
                      .then((data) => {
                        if (data.message) {
                          toast.error(
                            <span>
                              Cant terminating Pod <b>{pod.metadata.name}</b>
                              <br />
                              {data.message}
                            </span>,
                          );
                        } else {
                          toast.info(
                            <span>
                              Terminating Pod <b>{pod.metadata.name}</b>
                            </span>,
                          );
                        }
                      })
                      .catch((reason) => {
                        toast.error(
                          <span>
                            Cant delete Pod <b>{pod.metadata.name}</b>
                            <br />
                            {reason.message}
                          </span>,
                        );
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
