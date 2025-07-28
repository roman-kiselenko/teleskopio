import { usePageState, setPage } from '@/store/page';
import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { Namespaces } from '~/components/Namespaces';
import { SearchField } from '~/components/SearchField';
import { AbstractPage } from '@/components/resources/Main';
import { useStorageClassesState, getStorageClasses } from '~/store/storageclasses';
import { useEffect } from 'react';
import storageClassColumns from '@/components/resources/Storage/columns/StorageClasses';

export function StoragePage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();
  const storageClassesState = useStorageClassesState();

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
          <span className="hidden md:block mx-auto text-muted-foreground text-xs font-bold">
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
          {currentPage.currentPage.get() === 'storageclasses' ? (
            <AbstractPage
              getData={getStorageClasses}
              state={() => Array.from(storageClassesState.get().values())}
              columns={storageClassColumns}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
