import { useEffect } from 'react';
import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { call } from '@/lib/api';
import type { ColumnDef } from '@tanstack/react-table';
import type { ApiResource } from '@/types';
import { currentClusterState } from '@/store/cluster';
import { useWS } from '@/context/WsContext';

interface DynamicResourceTableProps<T> {
  kind: string;
  group: string;
  columns: ColumnDef<T, any>[];
  state: () => Map<string, T>;
  setState: (setter: (prev: Map<string, T>) => Map<string, T>) => void;
  withoutJump?: Boolean;
  withNsSelector?: Boolean;
  withSearch?: Boolean;
}

export const DynamicResourceTable = <T extends { metadata: { uid?: string } }>({
  kind,
  group,
  columns,
  state,
  setState,
  withoutJump,
  withNsSelector = true,
  withSearch = true,
}: DynamicResourceTableProps<T>) => {
  const subscribeEvents = async (rv: string, apiResource: ApiResource | undefined) => {
    await call('watch_dynamic_resource', {
      request: {
        ...apiResource,
        resource_version: rv,
      },
    });
  };
  const { listen } = useWS();

  const listenEvents = async () => {
    const context = currentClusterState.context.get();
    const server = currentClusterState.server.get();
    listen(`${kind}-${context}-${server}-deleted`, (payload: any) => {
      setState((prev) => {
        const newMap = new Map(prev);
        newMap.delete(payload.metadata?.uid as string);
        return newMap;
      });
    });

    listen(`${kind}-${context}-${server}-updated`, (payload: any) => {
      setState((prev) => {
        const newMap = new Map(prev);
        newMap.set(payload.metadata?.uid as string, payload);
        return newMap;
      });
    });
  };

  const getPage = async ({
    limit,
    continueToken,
    apiResource,
  }: {
    limit: number;
    continueToken?: string;
    apiResource: ApiResource | undefined;
  }) => {
    return await call('list_dynamic_resource', {
      limit: limit,
      continue: continueToken,
      request: {
        ...apiResource,
      },
    });
  };

  useEffect(() => {
    listenEvents();
  }, []);

  return (
    <PaginatedTable<T>
      kind={kind}
      group={group}
      subscribeEvents={subscribeEvents}
      getPage={getPage}
      state={state}
      setState={setState}
      extractKey={(item) => item.metadata?.uid as string}
      columns={columns}
      withoutJump={withoutJump}
      withNsSelector={withNsSelector}
      withSearch={withSearch}
    />
  );
};
