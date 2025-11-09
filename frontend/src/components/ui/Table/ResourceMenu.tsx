import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ClipboardCopy, Rss, Trash, Ruler, HandHelping, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router';
import { NodeDrainMenu, NodeCordonMenu } from '@/components/ui/Table/ContextMenu/Node';
import type { ApiResource } from '@/types';
import { CronJobTriggerMenu } from './ContextMenu/CronJob';

export default function ResourceMenu({
  apiResource,
  kind,
  children,
  setOpenDeleteDialog,
  setOpenScaleDialog,
  setOpenDrainDialog,
  setOpenCordonDialog,
  table,
  obj,
}: {
  kind: string;
  apiResource: ApiResource | undefined;
  setOpenDeleteDialog: (close: boolean) => void;
  setOpenScaleDialog: any;
  setOpenCordonDialog: any;
  setOpenDrainDialog: any;
  table: any;
  children: any;
  obj: any;
}) {
  let navigate = useNavigate();
  const key = obj?.metadata?.name;
  const owner =
    obj?.metadata?.ownerReferences?.length > 0 ? obj?.metadata?.ownerReferences[0] : undefined;

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
        {kind === 'CronJob' && table.getSelectedRowModel().rows.length === 0 && (
          <CronJobTriggerMenu key={key} obj={obj} apiResource={apiResource} />
        )}
        {table.getSelectedRowModel().rows.length === 0 && (
          <ContextMenuItem
            key={`${key}-${Math.random()}`}
            className="text-xs"
            onClick={() =>
              navigate(
                `/yaml/${owner.kind}/${owner.name}/${obj?.metadata?.namespace}?group=${owner.apiVersion.split('/')[0]}`,
              )
            }
            hidden={owner === undefined}
          >
            <div className="flex flex-row">
              <HandHelping size={8} /> <span className="ml-2">Owner</span>
            </div>
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
            hidden={table.getSelectedRowModel().rows.length !== 1}
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
          <>
            <NodeCordonMenu
              keyPrefix={key}
              setOpenCordonDialog={setOpenCordonDialog}
              table={table}
            />
            <NodeDrainMenu keyPrefix={key} setOpenDrainDialog={setOpenDrainDialog} table={table} />
          </>
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
