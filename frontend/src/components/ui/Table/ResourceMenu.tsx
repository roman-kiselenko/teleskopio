import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  FireExtinguisher,
  ClipboardCopy,
  Rss,
  Trash,
  Ruler,
  CirclePlay,
  CirclePause,
  ScrollText,
  RotateCw,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { ApiResource } from '@/types';
import { call } from '@/lib/api';

export default function ResourceMenu({
  apiResource,
  kind,
  children,
  setOpenDeleteDialog,
  setOpenScaleDialog,
  setOpenDrainDialog,
  table,
  obj,
}: {
  kind: string;
  apiResource: ApiResource | undefined;
  setOpenDeleteDialog: (close: boolean) => void;
  setOpenScaleDialog: any;
  setOpenDrainDialog: any;
  table: any;
  children: any;
  obj: any;
}) {
  let navigate = useNavigate();
  const key = obj?.metadata?.name;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          key={`${key}-${Math.random()}`}
          className="text-xs"
          hidden={table.getSelectedRowModel().rows.length > 0}
          onClick={() => {
            navigator.clipboard.writeText(obj.metadata?.name);
          }}
        >
          <ClipboardCopy size={8} />
          Copy name
        </ContextMenuItem>
        {kind !== 'Event' && (
          <ContextMenuItem
            key={`${key}-${Math.random()}`}
            hidden={table.getSelectedRowModel().rows.length > 0}
            className="text-xs"
            onClick={() =>
              navigate(
                `/resource/ResourceEvents/${obj.kind}/${obj?.metadata?.uid}/${obj?.metadata?.namespace}/${obj?.metadata.name}`,
              )
            }
          >
            <div className="flex flex-row">
              <Rss size={8} /> <span className="ml-2">Events</span>
            </div>
          </ContextMenuItem>
        )}
        {kind === 'Node' && table.getSelectedRowModel().rows.length === 0 && (
          <ContextMenuItem
            key={`${key}-${Math.random()}`}
            className="text-xs"
            onClick={() => {
              const cordoned = obj.spec?.taints?.find(
                (t) => t.effect === 'NoSchedule' && t.key === 'node.kubernetes.io/unschedulable',
              );
              let request = {
                cordon: cordoned ? false : true,
                name: obj.metadata?.name,
                ...apiResource,
              };
              call(`${cordoned ? 'uncordon' : 'cordon'}_node`, {
                ...request,
                resourceName: obj.metadata?.name,
              })
                .then((data) => {
                  if (data.message) {
                    toast.error(
                      <span>
                        Cant {cordoned ? 'uncordone' : 'cordone'} Node <b>{obj.metadata?.name}</b>
                        <br />
                        {data.message}
                      </span>,
                    );
                  } else {
                    toast.info(
                      <span>
                        Node <b>{obj.metadata?.name}</b> {cordoned ? 'uncordoned' : 'cordoned'}
                      </span>,
                    );
                  }
                })
                .catch((reason) => {
                  toast.error(
                    <span>
                      Cant {cordoned ? 'uncordon' : 'cordon'} <b>{obj.metadata?.name}</b>
                      <br />
                      {reason.message}
                    </span>,
                  );
                });
            }}
          >
            {obj.spec?.taints?.find(
              (t) => t.effect === 'NoSchedule' && t.key === 'node.kubernetes.io/unschedulable',
            ) ? (
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
          </ContextMenuItem>
        )}
        {kind === 'CronJob' && table.getSelectedRowModel().rows.length === 0 && (
          <ContextMenuItem
            key={`${key}-${Math.random()}`}
            className="text-xs"
            onClick={() => {
              call(`trigger_cronjob`, {
                ...apiResource,
                namespace: obj.metadata?.namespace,
                resourceName: obj.metadata?.name,
              })
                .then((data) => {
                  if (data.message) {
                    toast.error(
                      <span>
                        Cant trigger cronjob {obj.metadata?.name}
                        <br />
                        {data.message}
                      </span>,
                    );
                  } else {
                    toast.info(
                      <span>
                        Cronjob {obj.metadata?.name} triggered
                        <br />
                        Job: {data.success} created
                      </span>,
                    );
                  }
                })
                .catch((reason) => {
                  toast.error(
                    <span>
                      Cant trigger cronjob {obj.metadata?.name}
                      <br />
                      {reason.message}
                    </span>,
                  );
                });
            }}
          >
            <RotateCw />
            Trigger
          </ContextMenuItem>
        )}
        {kind === 'Pod' && table.getSelectedRowModel().rows.length === 0 && (
          <ContextMenuItem
            key={`${key}-${Math.random()}`}
            className="text-xs"
            onClick={() =>
              navigate(`/resource/Logs/${obj?.metadata?.namespace}/${obj?.metadata?.name}`)
            }
            disabled={
              obj?.metadata?.deletionTimestamp ? true : false || obj?.status?.phase === 'Pending'
            }
          >
            <div className="flex flex-row">
              <ScrollText size={8} /> <span className="ml-2">Logs</span>
            </div>
          </ContextMenuItem>
        )}
        {(kind === 'Deployment' || kind === 'ReplicaSet') && (
          <ContextMenuItem
            key={`${key}-${Math.random()}`}
            onClick={() => setOpenScaleDialog(true)}
            className="text-xs"
          >
            <div className="flex flex-row items-center">
              <Ruler size={8} className="mr-2" />
              <div>Scale</div>
            </div>
          </ContextMenuItem>
        )}
        {kind === 'Node' && table.getSelectedRowModel().rows.length > 0 && (
          <ContextMenuItem
            key={`${key}-${Math.random()}`}
            className="text-xs"
            variant="destructive"
            onClick={() => setOpenDrainDialog(true)}
          >
            <FireExtinguisher color="red" size={8} />
            Drain{' '}
            {table.getSelectedRowModel().rows.length > 0
              ? `(${table.getSelectedRowModel().rows.length})`
              : ``}
          </ContextMenuItem>
        )}
        <ContextMenuItem
          key={`${key}-${Math.random()}`}
          variant="destructive"
          hidden={table.getSelectedRowModel().rows.length === 0}
          className="text-xs"
          onClick={() => setOpenDeleteDialog(true)}
        >
          <Trash size={8} />
          Delete{' '}
          {table.getSelectedRowModel().rows.length > 0
            ? `(${table.getSelectedRowModel().rows.length})`
            : ``}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
