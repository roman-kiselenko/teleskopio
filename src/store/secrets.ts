import { hookstate, useHookstate } from '@hookstate/core';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { Secret } from '@/types';

export const secretsState = hookstate<Map<string, Secret>>(new Map());

export async function getSecrets(path: string, context: string, query: string) {
  try {
    const secrets = await invoke<Secret[]>('get_secrets', { path: path, context: context });
    console.log('found secrets', secrets);
    secretsState.set((prev) => {
      const newMap = new Map(prev);
      secrets.forEach((p) => {
        newMap.set(p.metadata.uid, p);
      });
      return newMap;
    });
  } catch (error: any) {
    toast.error('Error! Cant load secrets\n' + error.message);
    console.log('Error! Cant load secrets\n' + error.message);
  }
}

export function useSecretsState() {
  return useHookstate(secretsState);
}
