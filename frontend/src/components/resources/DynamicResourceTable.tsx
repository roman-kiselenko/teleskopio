import { useEffect } from 'react';
import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { call } from '@/lib/api';
import type { ColumnDef } from '@tanstack/react-table';
import type { ApiResource } from '@/types';
import { currentClusterState } from '@/store/cluster';
import { useWS } from '@/context/WsContext';
import { addSubscription } from '@/lib/subscriptionManager';

interface DynamicResourceTableProps<T> {
  kind: string;
  group: string;
  contextMenuItems?: any;
  columns: ColumnDef<T, any>[];
  state: () => Map<string, T>;
  setState: (setter: (prev: Map<string, T>) => Map<string, T>) => void;
  withoutJump?: boolean;
  withNsSelector?: boolean;
  withSearch?: boolean;
  doubleClickDisabled?: boolean;
  deleteDisabled?: boolean;
}

export const DynamicResourceTable = <T extends { metadata: { uid?: string } }>({
  kind,
  group,
  contextMenuItems,
  columns,
  state,
  setState,
  withoutJump,
  withNsSelector = true,
  withSearch = true,
  doubleClickDisabled = false,
  deleteDisabled = false,
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
    const server = currentClusterState.server.get();
    addSubscription(
      await listen(`${kind}-${server}-deleted`, (payload: any) => {
        setState((prev) => {
          const newMap = new Map(prev);
          newMap.delete(payload.metadata?.uid as string);
          return newMap;
        });
      }),
    );

    addSubscription(
      await listen(`${kind}-${server}-updated`, (payload: any) => {
        setState((prev) => {
          const newMap = new Map(prev);
          newMap.set(payload.metadata?.uid as string, payload);
          return newMap;
        });
      }),
    );
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
      contextMenuItems={contextMenuItems}
      subscribeEvents={subscribeEvents}
      getPage={getPage}
      state={state}
      setState={setState}
      extractKey={(item) => item.metadata?.uid as string}
      columns={columns}
      withoutJump={withoutJump}
      withNsSelector={withNsSelector}
      withSearch={withSearch}
      doubleClickDisabled={doubleClickDisabled}
      deleteDisabled={deleteDisabled}
    />
  );
};
