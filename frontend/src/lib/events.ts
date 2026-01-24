import { getLocalKey } from '@/lib/localStorage';
import type { ServerInfo } from '@/types';

export async function stopLogsWatcher(name: string, namespace: string, container: string) {
  const config = getLocalKey('currentServer');
  const configInfo = JSON.parse(config) as ServerInfo;
  const server = configInfo.server;
  if (configInfo.hasOwnProperty('server')) {
    return;
  }
  const token = localStorage.getItem('token');
  await fetch(`/api/stop_pod_log_stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? token : '',
    },
    body: JSON.stringify({ server, name, namespace, container }),
  });
}
