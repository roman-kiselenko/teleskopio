import { SquareMousePointer, Ruler, MoreHorizontal, ClipboardCopy, Trash, Rss } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

function Actions({
  resource,
  name,
  url,
  action,
  request,
  children,
  noEvents = false,
  scale = false,
}: {
  resource: any;
  url: string;
  name: string;
  action: string;
  request: any;
  children?: any;
  noEvents?: Boolean;
  scale?: Boolean;
}) {
  let navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openScaleDialog, setOpenScaleDialog] = useState(false);
  const [scaleValue, setScaleValue] = useState(resource.spec?.replicas || 0);
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
            onClick={() => setOpenDeleteDialog(true)}
            disabled={resource.metadata?.deletionTimestamp !== undefined}
            className="text-xs"
          >
            <div className="flex flex-row">
              <Trash size={8} color="red" /> <span className="ml-2 text-red-500">Delete</span>
            </div>
          </DropdownMenuItem>
          {scale ? (
            <DropdownMenuItem onClick={() => setOpenScaleDialog(true)} className="text-xs">
              <div className="flex flex-row items-center">
                <div>
                  <Ruler size={8} className="mr-2" />
                </div>
                <div>Scale</div>
              </div>
            </DropdownMenuItem>
          ) : (
            <></>
          )}
          {noEvents ? (
            <></>
          ) : (
            <DropdownMenuItem
              key="dm4"
              className="text-xs"
              onClick={() =>
                navigate(
                  `/resource/ResourceEvents/${resource.kind}/${resource?.metadata?.uid}/${resource?.metadata?.namespace}/${resource?.metadata.name}`,
                )
              }
            >
              <div className="flex flex-row">
                <Rss size={8} /> <span className="ml-2">Events</span>
              </div>
            </DropdownMenuItem>
          )}
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
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xs">Are you sure?</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <p className="text-xs">
            This operation cant be undone!
            <br />
            {resource.kind} <span className="text-red-600">{resource.metadata.name}</span> will be
            deleted.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              className="text-xs"
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
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
                setOpenDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {scale ? (
        <Dialog open={openScaleDialog} onOpenChange={setOpenScaleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xs">Scale {resource.kind}</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="text-xs">
              {resource.metadata.namespace}/{resource.metadata.name}
            </div>
            <div className="flex flex-col items-center">
              <Input
                type="number"
                min="0"
                onChange={(e) => setScaleValue(e.target.value)}
                value={scaleValue}
                className="placeholder:text-muted-foreground flex h-7 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Slider
                onValueChange={(e) => setScaleValue(e)}
                value={[scaleValue]}
                className="pt-4"
                min={0}
                step={1}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setOpenScaleDialog(false)}
                className="text-xs"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  call('scale_resource', {
                    ...request,
                    replicas: parseInt(scaleValue),
                  })
                    .then((data) => {
                      toast.info(
                        <span>
                          Scaling {resource.kind} <b>{resource.metadata.name}</b> from{' '}
                          {resource.spec?.replicas} to {scaleValue}
                        </span>,
                      );
                    })
                    .catch((reason) => {
                      toast.error(
                        <span>
                          Cant scale <b>{resource.metadata.name}</b>
                          <br />
                          {reason.message}
                        </span>,
                      );
                    });
                  setOpenScaleDialog(false);
                }}
                className="text-xs"
                variant="plain"
              >
                Scale
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Actions;
