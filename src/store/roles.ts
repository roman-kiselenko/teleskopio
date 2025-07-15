import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const rolesState = hookstate<{ roles: Object[] }>({
  roles: [],
});

export async function getRoles(path: string, context: string) {
  try {
    const roles = await invoke<any>('get_roles', { path: path, context: context });
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
