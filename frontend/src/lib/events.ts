import { currentClusterState } from '@/store/cluster';

export async function stopLogsWatcher(name: string, namespace: string, container: string) {
  const server = currentClusterState.server.get();
  if (server === '') {
    return;
  }
  await fetch(`/api/stop_pod_log_stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ server, name, namespace, container }),
  });
}
