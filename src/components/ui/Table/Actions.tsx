import { SquareMousePointer, MoreHorizontal, ClipboardCopy, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { invoke } from '@tauri-apps/api/core';
import { useNavigate } from 'react-router';

function Actions({
  resource,
  name,
  action,
  payload,
  children,
}: {
  resource: any;
  name: string;
  action: string;
  payload: any;
  children?: any;
}) {
  let navigate = useNavigate();
  let full_path = `/${resource.kind.toLowerCase()}s/${resource.metadata.namespace}/${resource.metadata.name}`;
  // TODO fixme
  if (resource.kind === 'Node') {
    full_path = `/cluster/${resource.metadata.name}`;
  }
  if (resource.kind === 'Namespace') {
    full_path = `/namespaces/${resource.metadata.name}`;
  }
  if (resource.kind === 'StorageClass') {
    full_path = `/storageclasses/${resource.metadata.name}`;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="text-xs sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="text-xs" onClick={() => navigate(full_path)}>
          <SquareMousePointer size={8} />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-xs"
          onClick={() => navigator.clipboard.writeText(resource.metadata.name)}
        >
          <ClipboardCopy size={8} />
          Copy name
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
                    Terminating {name} <b>{resource.metadata.name}</b>
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
        {children ? (
          <div>
            <DropdownMenuSeparator />
            {children}
          </div>
        ) : (
          <></>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Actions;
