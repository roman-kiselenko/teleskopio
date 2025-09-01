import { ArrowBigLeft, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { call } from '@/lib/api';
import { stopEventsWatcher } from '@/lib/events';
import { useNavigate } from 'react-router-dom';
import { useVersionState } from '@/store/version';
import { useLoaderData } from 'react-router';
import { ColumnDef } from '@tanstack/react-table';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { Header } from '@/components/Header';
import AgeCell from '@/components/ui/Table/AgeCell';
import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { apiResourcesState } from '@/store/apiResources';
import type { ApiResource } from '@/types';
import { compareVersions } from 'compare-versions';
import { currentClusterState } from '@/store/cluster';
import { getVersion } from '@/store/version';
import { useWS } from '@/context/WsContext';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'message',
    id: 'message',
    header: 'Message',
    cell: memo(({ row }) => {
      const version = useVersionState();
      return (
        <div>
          {compareVersions(version.version.get(), '1.20') === 1
            ? row.original.note
            : row.original.message}
        </div>
      );
    }),
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
  const { uid, namespace, name } = useLoaderData();
  const version = useVersionState();
  const [events, setEvents] = useState<Map<string, any>>(new Map());
  let navigate = useNavigate();
  const { listen } = useWS();

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const listenEvents = async () => {
      const context = currentClusterState.context.get();
      const server = currentClusterState.server.get();
      unlisten = await listen(`${uid}-${context}-${server}-updated`, (payload: any) => {
        if (compareVersions(version.version.get(), '1.20') === 1) {
          if (payload?.regarding?.uid === uid) {
            setEvents((prev) => {
              const newMap = new Map(prev);
              newMap.set(payload.metadata?.uid as string, payload);
              return newMap;
            });
          }
        } else {
          if (payload?.involvedObject?.uid === uid) {
            setEvents((prev) => {
              const newMap = new Map(prev);
              newMap.set(payload.metadata?.uid as string, payload);
              return newMap;
            });
          }
        }
      });
    };
    listenEvents();
    return () => {
      if (unlisten) {
        unlisten();
      }
      stopEventsWatcher(uid);
    };
  }, []);

  const subscribeEvents = async (rv: string) => {
    const resource = apiResourcesState.get().find((r: ApiResource) => {
      if (compareVersions(version.version.get(), '1.20') === 1) {
        return r.kind === 'Event' && r.group === 'events.k8s.io';
      } else {
        return r.kind === 'Event' && r.group === '';
      }
    });
    await call('watch_events_dynamic_resource', {
      uid: uid,
      request: {
        ...resource,
        resource_version: rv,
      },
    });
  };

  const getPage = async ({ limit, continueToken }: { limit: number; continueToken?: string }) => {
    const resource = apiResourcesState.get().find((r: ApiResource) => {
      if (compareVersions(version.version.get(), '1.20') === 1) {
        return r.kind === 'Event' && r.group === 'events.k8s.io';
      } else {
        return r.kind === 'Event' && r.group === '';
      }
    });

    return await call('list_events_dynamic_resource', {
      limit: limit,
      continueToken,
      uid: uid,
      request: {
        ...resource,
      },
    });
  };
  let kind: string;
  let group: string;
  if (compareVersions(getVersion(), '1.20') === 1) {
    kind = 'Event';
    group = 'events.k8s.io';
  } else {
    kind = 'Event';
    group = '';
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        navigate(-1);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  return (
    <>
      <div className="flex flex-row py-2 px-2 border-b items-center justify-start sticky top-0 z-10 bg-background">
        <Button title="back" className="text-xs bg-blue-500" onClick={() => navigate(-1)}>
          <ArrowBigLeft /> Esc
        </Button>
        <div className="flex flex-row px-2 items-start text-xs">
          <Rss className="mr-1" size={14} />
          <span>{namespace && namespace !== 'undefined' ? `${namespace}/${name}` : name}</span>
        </div>
      </div>
      <PaginatedTable
        kind={kind}
        group={group}
        subscribeEvents={subscribeEvents}
        getPage={getPage}
        state={() => events as Map<string, any>}
        setState={setEvents}
        extractKey={(item) => item.metadata?.uid as string}
        columns={columns}
        namespaced={false}
        withNsSelector={false}
        withoutJump={true}
      />
    </>
  );
}
