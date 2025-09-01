// import { listen, UnlistenFn } from '@tauri-apps/api/event';
// import { invoke } from '@tauri-apps/api/core';
import { currentClusterState } from '@/store/cluster';

export async function listenEvent<T>(
  eventName: string,
  handler: (payload: T) => void,
): Promise<any> {
  // const unlisten = await listen<T>(eventName, (event) => {
  //   handler(event.payload);
  // });
  // return unlisten;
}

export async function stopEventsWatcher(uid: string) {
  const server = currentClusterState.server.get();
  const context = currentClusterState.context.get();
  if (server === '' || context === '') {
    return;
  }
  // invoke('stop_watch_events', { path, context, uid }).catch(console.error);
}

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
