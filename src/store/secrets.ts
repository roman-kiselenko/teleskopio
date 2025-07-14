import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const secretsState = hookstate<{ secrets: Object[] }>({
  secrets: [],
});

export async function getSecrets(path: string, context: string) {
  try {
    const secrets = await invoke<any>('get_secrets', { path: path, context: context });
    console.log('found secrets', secrets);
    secretsState.secrets.set(secrets);
  } catch (error: any) {
    toast.error('Error! Cant load secrets\n' + error.message);
    console.log('Error! Cant load secrets\n' + error.message);
  }
}

export function useSecretsState() {
  return useHookstate(secretsState);
}
