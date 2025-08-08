import { listen, UnlistenFn } from '@tauri-apps/api/event';

export async function listenEvent<T>(
  eventName: string,
  handler: (payload: T) => void,
): Promise<UnlistenFn> {
  const unlisten = await listen<T>(eventName, (event) => {
    handler(event.payload);
  });

  return unlisten;
}
