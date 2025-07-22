import { usePageState, setPage } from '@/store/page';
import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { Namespaces } from '~/components/Namespaces';
import { SearchField } from '~/components/SearchField';
import PVs from '~/components/resources/Storage/PVs';
import StorageClasses from '~/components/resources/Storage/StorageClasses';
import { useEffect } from 'react';

export function StoragePage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();

  useEffect(() => {
    setPage('storageclasses');
  }, ['storageclasses']);
  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center justify-between flex-shrink-0 h-12 border-b border-gray-300">
        <button className="relative focus:outline-none group">
          <SearchField />
        </button>
        <div className="flex items-center justify-between w-full h-12 px-2">
          <span className="hidden md:block text-muted-foreground text-xs font-bold">
            {cc.cluster.get()} {cv.version.get()}
          </span>
        </div>
        <div className="relative text-sm focus:outline-none group">
          <div className="flex items-center w-full h-12 px-4">
            <Namespaces />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          {currentPage.currentPage.get() === 'storageclasses' ? <StorageClasses /> : <></>}
          {currentPage.currentPage.get() === 'pvs' ? <PVs /> : <></>}
        </div>
      </div>
    </div>
  );
}
