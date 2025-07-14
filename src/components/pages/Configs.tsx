import { usePageState, setPage } from '@/store/page';
import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import Configmaps from '~/components/resources/Configs/Configmaps';
import Secrets from '~/components/resources/Configs/Secrets';
import { Namespaces } from '~/components/Namespaces';
import { useEffect } from 'react';

export function ConfigsPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();

  useEffect(() => {
    setPage('configmaps');
  }, ['configmaps']);
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
          {currentPage.currentPage.get() === 'configmaps' ? <Configmaps /> : <></>}
          {currentPage.currentPage.get() === 'secrets' ? <Secrets /> : <></>}
        </div>
      </div>
    </div>
  );
}
