import { ContextMenuItem } from '@/components/ui/context-menu';
import { CirclePause, FireExtinguisher } from 'lucide-react';

export function NodeDrainMenu({
  table,
  keyPrefix,
  setOpenDrainDialog,
}: {
  table: any;
  keyPrefix: string;
  setOpenDrainDialog: (boolean) => void;
}) {
  return (
    <ContextMenuItem
      key={`${keyPrefix}-${Math.random()}`}
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
  );
}

export function NodeCordonMenu({
  keyPrefix,
  setOpenCordonDialog,
  table,
}: {
  setOpenCordonDialog: any;
  keyPrefix: string;
  table: any;
}) {
  return (
    <ContextMenuItem
      key={`${keyPrefix}-${Math.random()}`}
      className="text-xs"
      variant="destructive"
      onClick={() => setOpenCordonDialog(true)}
    >
      <CirclePause color="red" size={8} />
      Cordon
      {table.getSelectedRowModel().rows.length > 0
        ? `(${table.getSelectedRowModel().rows.length})`
        : ``}
    </ContextMenuItem>
  );
}
