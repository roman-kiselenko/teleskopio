import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useServicesState, servicesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Network/columns/Services';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Service } from '@/types';

const globalServicesState = async () => {
  try {
    await invoke('start_service_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<Service[]>('service-update', (event) => {
    const se = event.payload;
    servicesState.set(() => {
      const newMap = new Map();
      se.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[Service[], string | null]>('get_services_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Services = () => {
  const servicesState = useServicesState();
  globalServicesState();
  return (
    <PaginatedTable<Service>
      getPage={getServicesPage}
      state={() => servicesState.get() as Map<string, Service>}
      setState={servicesState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Services;
