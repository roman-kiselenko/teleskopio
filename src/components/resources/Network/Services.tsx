import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useServicesState, servicesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Network/columns/Services';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Service } from 'kubernetes-models/v1';

const subscribeServicesEvents = async (rv: string) => {
  await invoke('service_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenServiceEvents = async () => {
  await listen<Service>('service-deleted', (event) => {
    const se = event.payload;
    servicesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.delete(se.metadata?.uid as string);
      return newMap;
    });
  });

  await listen<Service>('service-updated', (event) => {
    const se = event.payload;
    servicesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(se.metadata?.uid as string, se);
      return newMap;
    });
  });
};

const getServicesPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Service[], string | null, string]>('get_services_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Services = () => {
  const servicesState = useServicesState();
  listenServiceEvents();
  return (
    <PaginatedTable<Service>
      subscribeEvents={subscribeServicesEvents}
      getPage={getServicesPage}
      state={() => servicesState.get() as Map<string, Service>}
      setState={servicesState.set}
      extractKey={(p) => p.metadata?.uid as string}
      columns={columns}
    />
  );
};

export default Services;
