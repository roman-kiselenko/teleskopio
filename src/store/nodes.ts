import { hookstate, useHookstate } from '@hookstate/core';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';

export const nodesState = hookstate<{ nodes: Node[] }>({
  nodes: [],
});

export async function getNodes(path: string, context: string) {
  try {
    const nodes = await invoke<any>('get_nodes', { path: path, context: context });
    console.log('found nodes', nodes);
    nodesState.nodes.set(nodes);
  } catch (error: any) {
    toast.error('Error! Cant load nodes\n' + error.message);
    console.log('Error! Cant load nodes\n' + error.message);
  }
}

export function useNodesState() {
  return useHookstate(nodesState);
}
