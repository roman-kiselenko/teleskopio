import { useEffect } from 'react';
import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { apiResourcesState } from '@/store/api-resources';
import { call } from '@/lib/api';
import { listenEvent } from '@/lib/events';
import type { ColumnDef } from '@tanstack/react-table';
import type { ApiResource } from '@/types';
import { currentClusterState } from '@/store/cluster';
import { addSubscription } from '@/lib/subscriptionManager';

interface DynamicResourceTableProps<T> {
  kind: string;
  columns: ColumnDef<T, any>[];
  state: () => Map<string, T>;
  setState: (setter: (prev: Map<string, T>) => Map<string, T>) => void;
  withoutJump?: Boolean;
}

export const DynamicResourceTable = <T extends { metadata: { uid?: string } }>({
  kind,
  columns,
  state,
  setState,
  withoutJump,
}: DynamicResourceTableProps<T>) => {
  const getApiResource = (): ApiResource => {
    const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === kind);
    if (!resource) throw new Error(`API resource for kind ${kind} not found`);
    return resource;
  };

  const subscribeEvents = async (rv: string) => {
    const resource = getApiResource();
    await call('watch_dynamic_resource', {
      request: {
        ...resource,
        resource_version: rv,
      },
    });
  };

  const listenEvents = async () => {
    const context = currentClusterState.context.get();
    await addSubscription(
      listenEvent(`${kind}-${context}-deleted`, (ev: any) => {
        setState((prev) => {
          const newMap = new Map(prev);
          newMap.delete(ev.metadata?.uid as string);
          return newMap;
        });
      }),
    );

    await addSubscription(
      listenEvent(`${kind}-${context}-updated`, (ev: any) => {
        setState((prev) => {
          const newMap = new Map(prev);
          newMap.set(ev.metadata?.uid as string, ev);
          return newMap;
        });
      }),
    );
  };

  const getPage = async ({ limit, continueToken }: { limit: number; continueToken?: string }) => {
    const resource = getApiResource();
    return await call('list_dynamic_resource', {
      limit: limit,
      continueToken,
      request: {
        ...resource,
      },
    });
  };

  useEffect(() => {
    listenEvents();
  }, []);

  return (
    <PaginatedTable<T>
      subscribeEvents={subscribeEvents}
      getPage={getPage}
      state={state}
      setState={setState}
      extractKey={(item) => item.metadata?.uid as string}
      columns={columns}
      withoutJump={withoutJump}
    />
  );
};
