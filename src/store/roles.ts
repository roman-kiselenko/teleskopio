import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const rolesState = hookstate<{ roles: Object[] }>({
  roles: [],
});

export async function getRoles(path: string, context: string, query: string) {
  try {
    let roles = await invoke<any>('get_roles', { path: path, context: context });
    roles.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      roles = roles.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }

    console.log('found roles', roles);
    rolesState.roles.set(roles);
  } catch (error: any) {
    toast.error('Error! Cant load roles\n' + error.message);
    console.log('Error! Cant load roles\n' + error.message);
  }
}

export function useRolesState() {
  return useHookstate(rolesState);
}
