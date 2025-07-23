import { MoreHorizontal, ClipboardCopy, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { invoke } from '@tauri-apps/api/core';

function Actions({
  resource,
  name,
  action,
  payload,
}: {
  resource: any;
  name: string;
  action: string;
  payload: any;
}) {
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
          onClick={() => navigator.clipboard.writeText(resource.metadata.name)}
        >
          <ClipboardCopy size={8} />
          Copy name
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs">
          <Pencil size={8} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={resource.metadata?.deletionTimestamp !== undefined}
          className="text-xs"
          onClick={async () => {
            toast.promise(invoke<any>(action, payload), {
              loading: 'Deleting...',
              success: () => {
                return (
                  <span>
                    {name} <b>{resource.metadata.name}</b> deleted
                  </span>
                );
              },
              error: (err) => (
                <span>
                  Cant delete {name} <b>{resource.metadata.name}</b>
                  <br />
                  {err.message}
                </span>
              ),
            });
          }}
        >
          {' '}
          <Trash size={8} /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Actions;
