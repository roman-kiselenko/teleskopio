import { currentClusterState } from '@/store/cluster';

export async function stopLogsWatcher(name: string, namespace: string, container: string) {
  const server = currentClusterState.server.get();
  const context = currentClusterState.context.get();
  if (server === '' || context === '') {
    return;
  }
  await fetch(`/api/stop_pod_log_stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ server, context, name, namespace, container }),
  });
}
