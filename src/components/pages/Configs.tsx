import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { usePageState, setPage } from '@/store/page';
import { SearchField } from '~/components/SearchField';
import Secrets from '@/components/resources/Configs/Secrets';
import ConfigMaps from '@/components/resources/Configs/ConfigMaps';
import Namespaces from '@/components/resources/Configs/Namespaces';
import { NamespaceSelector } from '@/components/NamespaceSelector';
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
        <button className="relative focus:outline-none group">
          <SearchField />
        </button>
        <div className="flex items-center justify-between w-full h-12 px-2">
          <span className="hidden md:block mx-auto text-muted-foreground text-xs font-bold">
            {cc.cluster.get()} {cv.version.get()}
          </span>
        </div>
        <div className="relative text-sm focus:outline-none group">
          <div className="flex items-center w-full h-12 px-4">
            <NamespaceSelector />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          {currentPage.currentPage.get() === 'secrets' ? <Secrets /> : <></>}
          {currentPage.currentPage.get() === 'configmaps' ? <ConfigMaps /> : <></>}
          {currentPage.currentPage.get() === 'namespaces' ? <Namespaces /> : <></>}
        </div>
      </div>
    </div>
  );
}
