import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { call } from '@/lib/api';
import { toast } from 'sonner';
import type { ApiResource } from '@/types';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import { useWS } from '@/context/WsContext';
import { addSubscription } from '@/lib/subscriptionManager';

interface DrainDialogProps {
  kind: string;
  apiResource: ApiResource | undefined;
  rows: any;
  open: boolean;
  setOpenDialog: (close: boolean) => void;
}

export function DrainDialog({ apiResource, kind, rows, open, setOpenDialog }: DrainDialogProps) {
  const obj = rows[0].original;
  const [drainLog, setDrainLog] = useState<{ pod: any; ns: any }[]>([]);
  const [drainForce, setDrainForce] = useState(true);
  const [isDraining, setIsDraining] = useState(false);
  const [IgnoreAllDaemonSets, setIgnoreAllDaemonSets] = useState(true);
  const [DeleteEmptyDirData, setDeleteEmptyDirData] = useState(true);
  const [drainTimeout, setDrainTimeout] = useState(60);
  const { listen } = useWS();

  useEffect(() => {
    const subscribe = async () => {
      addSubscription(
        await listen(`drain_${obj.metadata.name}_${obj.metadata.uid}`, (payload: any) => {
          setDrainLog((prev) => [{ pod: payload.pod, ns: payload.ns }, ...prev]);
        }),
      );
    };

    subscribe();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xs">Set drain parameters</DialogTitle>
          <DialogDescription>
            <div className="flex flex-row items-center py-2">
              <Checkbox
                checked={drainForce}
                onCheckedChange={() => setDrainForce(!drainForce)}
                id="force"
              />
              <Label className="pl-1 text-xs" htmlFor="force">
                Force
              </Label>
            </div>
            <div className="flex flex-row items-center py-2">
              <Checkbox
                checked={IgnoreAllDaemonSets}
                onCheckedChange={() => setIgnoreAllDaemonSets(!IgnoreAllDaemonSets)}
                id="IgnoreAllDaemonSets"
              />
              <Label className="pl-1 text-xs" htmlFor="IgnoreAllDaemonSets">
                IgnoreAllDaemonSets
              </Label>
            </div>
            <div className="flex flex-row items-center py-2">
              <Checkbox
                checked={DeleteEmptyDirData}
                onCheckedChange={() => setDeleteEmptyDirData(!DeleteEmptyDirData)}
                id="DeleteEmptyDirData"
              />
              <Label className="pl-1 text-xs" htmlFor="DeleteEmptyDirData">
                DeleteEmptyDirData
              </Label>
            </div>
            <div className="flex flex-row items-center py-2">
              <Input
                type="number"
                id="Timeout"
                onChange={(e) => setDrainTimeout(parseInt(e.target.value))}
                value={drainTimeout}
                className="placeholder:text-muted-foreground flex h-7 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 w-[80px]"
              />
              <Label className="pl-1 text-xs" htmlFor="Timeout">
                Timeout sec
              </Label>
            </div>
            <div className="flex flex-row items-center py-2">
              <Button
                disabled={isDraining}
                onClick={() => {
                  setIsDraining(true);
                  call('drain_node', {
                    drainForce: drainForce,
                    IgnoreAllDaemonSets: IgnoreAllDaemonSets,
                    DeleteEmptyDirData: DeleteEmptyDirData,
                    drainTimeout: drainTimeout,
                    resourceName: obj.metadata?.name,
                    resourceUid: obj.metadata?.uid,
                  })
                    .then((data) => {
                      if (data.message) {
                        setIsDraining(false);
                        toast.error(
                          <span>
                            Cant drain Node <b>{obj.metadata?.name}</b>
                            <br />
                            {data.message}
                          </span>,
                        );
                      } else {
                        setIsDraining(false);
                        toast.info(
                          <span>
                            Node <b>{obj.metadata?.name}</b> drained
                          </span>,
                        );
                      }
                    })
                    .catch((reason) => {
                      setIsDraining(false);
                      toast.error(
                        <span>
                          Cant drain Node <b>{obj.metadata?.name}</b>
                          <br />
                          {reason.message}
                        </span>,
                      );
                    });
                }}
                className="text-xs"
                variant="plain"
              >
                {isDraining ? 'Draining...' : 'Drain'}
              </Button>
            </div>
            <div className="w-full h-1/2 overflow-y-auto overflow-x-auto text-xs p-0">
              {drainLog.map((ev: any, index: number) => (
                <div key={index} className="text-xs flex flex-row whitespace-nowrap items-center">
                  <span>
                    <Package size={12} />
                  </span>
                  <div>
                    {ev.ns}/{ev.pod} Evicted
                  </div>
                </div>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
