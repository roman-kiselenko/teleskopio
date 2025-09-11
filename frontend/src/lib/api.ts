import { currentClusterState } from '@/store/cluster';

type InvokePayload = Record<string, unknown>;

export async function call<T = any>(action: string, payload?: InvokePayload): Promise<T | any> {
  let request = { ...payload };
  if (currentClusterState.server.get() !== '') {
    request.server = currentClusterState.server.get();
  }
  const token = localStorage.getItem('token');
  if (payload) {
    if (action !== 'lookup_configs' && action !== 'ping') {
      console.log(`[${action}] hit payload [${JSON.stringify(request)}]`);
    }
    const res = await fetch(`/api/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? token : '',
      },
      body: JSON.stringify(request),
    });
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return res.json();
    }
    if (contentType.includes('application/yaml') || contentType.includes('text/yaml')) {
      return res.text();
    }
    return res.text();
  }
  if (action !== 'lookup_configs' && action !== 'ping') {
    console.log(`[${action}] hit`);
  }
  const res = await fetch(`/api/${action}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? token : '',
    },
  });
  return res.json();
}
