import { SquareMousePointer, MoreHorizontal, ClipboardCopy, Trash, Rss } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { call } from '@/lib/api';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function Actions({
  resource,
  name,
  url,
  action,
  request,
  children,
}: {
  resource: any;
  url: string;
  name: string;
  action: string;
  request: any;
  children?: any;
}) {
  let navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
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
          <DropdownMenuItem key="dm1" className="text-xs" onClick={() => navigate(url)}>
            <SquareMousePointer size={8} />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem
            key="dm2"
            className="text-xs"
            onClick={() => navigator.clipboard.writeText(resource.metadata.name)}
          >
            <ClipboardCopy size={8} />
            Copy name
          </DropdownMenuItem>
          <DropdownMenuItem
            key="dm3"
            onClick={() => setOpenDialog(true)}
            disabled={resource.metadata?.deletionTimestamp !== undefined}
            className="text-xs"
          >
            <div className="flex flex-row">
              <Trash size={8} color="red" /> <span className="ml-2 text-red-500">Delete</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            key="dm4"
            className="text-xs"
            onClick={() =>
              navigate(
                `/events/${resource.kind}/${resource?.metadata?.uid}/${resource?.metadata?.namespace}/${resource?.metadata.name}`,
              )
            }
          >
            <div className="flex flex-row">
              <Rss size={8} /> <span className="ml-2">Events</span>
            </div>
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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xs">Are you sure?</DialogTitle>
          </DialogHeader>
          <p className="text-xs">
            This operation cant be undone!
            <br />
            {resource.kind} <span className="text-red-600">{resource.metadata.name}</span> will be
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
                toast.promise(call(action, request), {
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
}

export default Actions;
