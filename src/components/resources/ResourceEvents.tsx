import { ArrowBigLeft, Pencil, Scroll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { call } from '@/lib/api';
import { listenEvent } from '@/lib/events';
import { resourceEventsState, useResourceEventsState } from '@/store/resource-events';
import { useNavigate } from 'react-router-dom';
import { useLoaderData } from 'react-router';
import { JumpCommand } from '@/components/ui/JumpCommand';
import { useVersionState } from '@/store/version';
import { ColumnDef } from '@tanstack/react-table';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import AgeCell from '@/components/ui/Table/AgeCell';
import { DataTable } from '@/components/ui/DataTable';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'note',
    id: 'note',
    header: 'Note',
    cell: memo(({ row }) => <div>{row.original.note} </div>),
  },
  {
    accessorKey: 'reason',
    id: 'reason',
    header: 'Reason',
    cell: memo(({ row }) => <div>{row.original.reason}</div>),
  },
  {
    accessorKey: 'type',
    id: 'type',
    header: memo(({ column }) => <HeaderAction column={column} name={'Type'} />),
    cell: memo(({ row }) => {
      let color = '';
      if (row.original.type !== 'Normal') {
        color = 'text-orange-500';
      }
      return <div className={color}>{row.original.type}</div>;
    }),
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export function ResourceEvents() {
  const { uid, namespace } = useLoaderData();
  const version = useVersionState();
  const eventsState = useResourceEventsState();
  let navigate = useNavigate();

  useEffect(() => {
    const subscribe = async () => {
      const events = await call('events_dynamic_resource', {
        uid: uid,
        namespace: namespace,
      });
      eventsState.set(events);
    };
    subscribe();
    return () => {};
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-row justify-between">
        <div>
          <JumpCommand />
        </div>
        <div>
          {version.version.get() === '' ? (
            <></>
          ) : (
            <p className="text-muted-foreground p-2 pt-3.5 text-xs">
              <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium opacity-100 select-none">
                {version.version.get()}
              </kbd>
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 p-1 border-b justify-items-stretch items-center">
        <div>
          <Button title="back" className="text-xs bg-blue-500" onClick={() => navigate(-1)}>
            <ArrowBigLeft />
          </Button>
        </div>
      </div>
      <div className="w-full h-screen overflow-y-auto text-xs p-0">
        <DataTable columns={columns} data={eventsState.get() as []} />
      </div>
    </div>
  );
}
