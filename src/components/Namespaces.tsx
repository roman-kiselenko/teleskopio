import { useCurrentClusterState } from '@/store/cluster';
import { useNamespacesState, getNamespaces } from '@/store/namespaces';
import { useEffect } from 'react';

export function Namespaces() {
  const cc = useCurrentClusterState();
  const ns = useNamespacesState();

  useEffect(() => {
    getNamespaces(cc.kube_config.get(), cc.cluster.get());
  }, [cc.kube_config.get(), cc.cluster.get()]);

  return (
    <div className="flex flex-col w-35 border-r border-gray-300">
      <button className="relative text-sm focus:outline-none group">
        <div className="flex items-center justify-between w-full h-12 px-3 border-b border-gray-300 hover:bg-blue-300">
          <span className="font-medium">Namespaces</span>
        </div>
      </button>
      <div className="flex flex-col flex-grow p-2 overflow-auto">
        {ns.namespaces.get().map((namespace: any, index) => (
          <a
            className="flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300"
            key={index}
            href="#"
          >
            <span className="leading-none">{namespace.metadata.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
