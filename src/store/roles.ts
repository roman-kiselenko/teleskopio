import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { Role } from '@/types';

export const rolesState = hookstate<Map<string, Role>>(new Map());

export async function getRoles(path: string, context: string, query: string) {
  try {
    const roles = await invoke<Role[]>('get_roles', { path: path, context: context });
    console.log('found roles', roles);
    rolesState.set((prev) => {
      const newMap = new Map(prev);
      roles.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load roles\n' + error.message);
    console.log('Error! Cant load roles\n' + error.message);
  }
}

export function useRolesState() {
  return useHookstate(rolesState);
}
