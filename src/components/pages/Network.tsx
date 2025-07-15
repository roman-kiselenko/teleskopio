import { usePageState, setPage } from '@/store/page';
import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { Namespaces } from '~/components/Namespaces';
import Services from '~/components/resources/Network/Services';
import Ingresses from '~/components/resources/Network/Ingresses';
import NetworkPolicies from '~/components/resources/Network/NetworkPolicies';
import { useEffect } from 'react';

export function NetworkPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();

  useEffect(() => {
    setPage('services');
  }, ['services']);
  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center justify-between flex-shrink-0 h-12 border-b border-gray-300">
        <button className="relative text-sm focus:outline-none group">
          <div className="flex items-center justify-between w-full h-12 px-2">
            <span className="font-medium">
              {cc.cluster.get()}:{cv.version.get()}
            </span>
          </div>
        </button>
        <div className="relative text-sm focus:outline-none group">
          <div className="flex items-center w-full h-12 px-4">
            <Namespaces />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          {currentPage.currentPage.get() === 'services' ? <Services /> : <></>}
          {currentPage.currentPage.get() === 'ingresses' ? <Ingresses /> : <></>}
          {currentPage.currentPage.get() === 'networkpolicies' ? <NetworkPolicies /> : <></>}
        </div>
      </div>
    </div>
  );
}
