type UnlistenFn = () => void;

const subscriptions: UnlistenFn[] = [];

export async function addSubscription(listenerPromise: () => void): Promise<void> {
  const unlisten = await listenerPromise;
  subscriptions.push(unlisten);
}

export function removeAllSubscriptions(): void {
  while (subscriptions.length > 0) {
    const unlisten = subscriptions.pop();
    try {
      unlisten?.();
    } catch (err) {
      console.error('error on unlisten:', err);
    }
  }
}
