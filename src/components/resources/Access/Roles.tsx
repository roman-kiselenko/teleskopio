import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useRolesState, rolesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Access/columns/Roles';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Role } from '@/types';

const subscribeRolesEvents = async (rv: string) => {
  await invoke('role_events', {
    path: currentClusterState.kube_config.get(),
    context: currentClusterState.cluster.get(),
    rv: rv,
  });
};

const listenRolesEvents = async () => {
  await listen<Role>('role-deleted', (event) => {
    const ro = event.payload;
    rolesState.set(() => {
      const newMap = new Map();
      newMap.delete(ro.metadata.uid);
      return newMap;
    });
  });

  await listen<Role>('role-updated', (event) => {
    const ro = event.payload;
    rolesState.set((prev) => {
      const newMap = new Map(prev);
      newMap.set(ro.metadata.uid, ro);
      return newMap;
    });
  });
};

const getRolesPage = async ({
  path,
  context,
  continueToken,
}: {
  path: string;
  context: string;
  continueToken?: string;
}) => {
  return await invoke<[Role[], string | null, string]>('get_roles_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Roles = () => {
  const rolesState = useRolesState();
  listenRolesEvents();
  return (
    <PaginatedTable<Role>
      subscribeEvents={subscribeRolesEvents}
      getPage={getRolesPage}
      state={() => rolesState.get() as Map<string, Role>}
      setState={rolesState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Roles;
