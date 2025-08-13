import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { getCRState } from '@/store/resources';
import columns from '@/components/resources/CustomResources/columns';
import { useLoaderData } from 'react-router';
import type { ApiResource } from '@/types';
import { call } from '@/lib/api';
import { useHookstate } from '@hookstate/core';

const subscribeCRsEvents = async (rv: string, apiResource: ApiResource | undefined) => {
  const request = {
    ...apiResource,
    resource_version: rv,
  };
  await call('watch_dynamic_resource', { request });
};

const getCRsPage = async ({
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
    continueToken: continueToken,
    request: {
      ...apiResource,
      namespaced: false,
    },
  });
};

export function useCRState(kind: string) {
  const store = getCRState(kind);
  return useHookstate(store);
}

const CustomResources = () => {
  const { kind, group } = useLoaderData();
  const cr = useCRState(kind);
  console.log(cr.get());
  return (
    <PaginatedTable
      kind={kind}
      group={group}
      subscribeEvents={subscribeCRsEvents}
      getPage={getCRsPage}
      state={() => cr.get() as Map<string, any>}
      setState={(updater) => {
        cr.set((prev) => {
          const copy = new Map<string, any>(prev);
          const newValue = typeof updater === 'function' ? updater(copy) : updater;
          return newValue;
        });
      }}
      extractKey={(p: any) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default CustomResources;
