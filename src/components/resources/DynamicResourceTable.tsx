import { useEffect } from 'react';
import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { currentClusterState } from '@/store/cluster';
import { apiResourcesState } from '@/store/api-resources';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { ColumnDef } from '@tanstack/react-table';
import type { ApiResource } from '@/types';

interface DynamicResourceTableProps<T> {
  kind: string;
  columns: ColumnDef<T, any>[];
  state: () => Map<string, T>;
  setState: (setter: (prev: Map<string, T>) => Map<string, T>) => void;
}

export const DynamicResourceTable = <T extends { metadata: { uid?: string } }>({
  kind,
  columns,
  state,
  setState,
}: DynamicResourceTableProps<T>) => {
  const getApiResource = (): ApiResource => {
    console.log(apiResourcesState.get());
    const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === kind);
    if (!resource) throw new Error(`API resource for kind ${kind} not found`);
    return resource;
  };

  const subscribeEvents = async (rv: string) => {
    const resource = getApiResource();
    await invoke('watch_dynamic_resource', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
      request: {
        ...resource,
        resource_version: rv,
      },
    });
  };

  const listenEvents = () => {
    listen<any>(`${kind}-deleted`, (event) => {
      const item = event.payload;
      setState((prev) => {
        const newMap = new Map(prev);
        newMap.delete(item.metadata?.uid as string);
        return newMap;
      });
    });

    listen<any>(`${kind}-updated`, (event) => {
      const item = event.payload;
      setState((prev) => {
        const newMap = new Map(prev);
        newMap.set(item.metadata?.uid as string, item);
        return newMap;
      });
    });
  };

  const getPage = async ({
    path,
    context,
    limit,
    continueToken,
  }: {
    path: string;
    context: string;
    limit: number;
    continueToken?: string;
  }) => {
    const resource = getApiResource();
    return await invoke<[T[], string | null, string]>('list_dynamic_resource', {
      path,
      context,
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
    />
  );
};
