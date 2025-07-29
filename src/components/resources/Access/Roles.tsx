import { PaginatedTable } from '@/components/resources/PaginatedTable';
import { useRolesState, rolesState } from '@/store/resources';
import { currentClusterState } from '@/store/cluster';
import columns from '@/components/resources/Access/columns/Roles';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Role } from '@/types';

const globalRolesState = async () => {
  try {
    await invoke('start_role_reflector', {
      path: currentClusterState.kube_config.get(),
      context: currentClusterState.cluster.get(),
    });
  } catch (error: any) {
    console.log('error start reflector ', error.message);
  }

  await listen<Role[]>('role-update', (event) => {
    const ro = event.payload;
    rolesState.set(() => {
      const newMap = new Map();
      ro.forEach((p) => newMap.set(p.metadata.uid, p));
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
  return await invoke<[Role[], string | null]>('get_roles_page', {
    path,
    context,
    limit: 50,
    continueToken,
  });
};

const Roles = () => {
  const rolesState = useRolesState();
  globalRolesState();
  return (
    <PaginatedTable<Role>
      getPage={getRolesPage}
      state={() => rolesState.get() as Map<string, Role>}
      setState={rolesState.set}
      extractKey={(p) => p.metadata.uid}
      columns={columns}
    />
  );
};

export default Roles;
