import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { usePageState, setPage } from '@/store/page';
import Pods from '~/components/resources/Workloads/Pods';
import Deployments from '~/components/resources/Workloads/Deployments';
import { useEffect } from 'react';

export function WorkloadsPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();

  useEffect(() => {
    setPage('pods');
  }, ['pods']);

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center flex-shrink-0 h-12 border-b border-gray-300">
        <button className="relative text-sm focus:outline-none group">
          <div className="flex items-center justify-between w-full h-12 px-2 hover:bg-blue-300">
            <span className="font-medium">
              {cc.cluster.get()}:{cv.version.get()}
            </span>
          </div>
        </button>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          {currentPage.currentPage.get() === 'pods' ? <Pods /> : <></>}
          {currentPage.currentPage.get() === 'deployments' ? <Deployments /> : <></>}
        </div>
      </div>
    </div>
  );
}
