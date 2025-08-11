import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { currentClusterState } from '@/store/cluster';

export async function listenEvent<T>(
  eventName: string,
  handler: (payload: T) => void,
): Promise<UnlistenFn> {
  const unlisten = await listen<T>(eventName, (event) => {
    handler(event.payload);
  });

  return unlisten;
}

export async function stopEventsWatcher(uid: string) {
  const path = currentClusterState.kube_config.get();
  const context = currentClusterState.context.get();
  invoke('stop_watch_events', { path, context, uid }).catch(console.error);
}

export async function stopLogsWatcher(name: string, namespace: string, container: string) {
  const path = currentClusterState.kube_config.get();
  const context = currentClusterState.context.get();
  invoke('stop_pod_log_stream', { path, context, name, namespace, container }).catch(console.error);
}
