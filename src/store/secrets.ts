import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import moment from 'moment';

export const secretsState = hookstate<{ secrets: Object[] }>({
  secrets: [],
});

export async function getSecrets(path: string, context: string, query: string) {
  try {
    let secrets = await invoke<any>('get_secrets', { path: path, context: context });
    secrets.sort(function (a, b) {
      return moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp));
    });
    if (query !== '') {
      secrets = secrets.filter((p) => {
        return String(p.metadata.name || '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    }
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
