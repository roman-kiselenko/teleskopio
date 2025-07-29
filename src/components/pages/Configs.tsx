import { usePageState, setPage } from '@/store/page';
import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { Namespaces } from '~/components/Namespaces';
import { SearchField } from '~/components/SearchField';
// import { AbstractPage } from '@/components/resources/PaginatedTable';
import { useConfigmapsState, getConfigmaps } from '~/store/configmaps';
import { useSecretsState, getSecrets } from '~/store/secrets';

import { useEffect } from 'react';

import configmapsColumns from '@/components/resources/Configs/columns/ConfigMaps';
import secretsColumns from '@/components/resources/Configs/columns/Secrets';

export function ConfigsPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();

  const secretsState = useSecretsState();
  const configmapsState = useConfigmapsState();

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
            <Namespaces />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          {/* {currentPage.currentPage.get() === 'secrets' ? (
            <AbstractPage
              getData={getSecrets}
              state={() => Array.from(secretsState.get().values())}
              columns={secretsColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'configmaps' ? (
            <AbstractPage
              getData={getConfigmaps}
              state={() => Array.from(configmapsState.get().values())}
              columns={configmapsColumns}
            />
          ) : (
            <></>
          )} */}
        </div>
      </div>
    </div>
  );
}
