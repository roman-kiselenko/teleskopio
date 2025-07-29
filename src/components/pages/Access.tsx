import { usePageState, setPage } from '@/store/page';
import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { Namespaces } from '~/components/Namespaces';
import { SearchField } from '~/components/SearchField';
// import { AbstractPage } from '@/components/resources/PaginatedTable';
import { useRolesState, getRoles } from '~/store/roles';
import { useServiceAccountsState, getServiceAccounts } from '~/store/serviceaccounts';
import { useEffect } from 'react';
import rolesColumns from '@/components/resources/Access/columns/Roles';
import saColumns from '@/components/resources/Access/columns/ServiceAccounts';

export function AccessPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();

  const rolesState = useRolesState();
  const saState = useServiceAccountsState();

  useEffect(() => {
    setPage('serviceaccounts');
  }, ['serviceaccounts']);
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
          {/* {currentPage.currentPage.get() === 'serviceaccounts' ? (
            <AbstractPage
              getData={getServiceAccounts}
              state={() => Array.from(saState.get().values())}
              columns={saColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'roles' ? (
            <AbstractPage
              getData={getRoles}
              state={() => Array.from(rolesState.get().values())}
              columns={rolesColumns}
            />
          ) : (
            <></>
          )} */}
        </div>
      </div>
    </div>
  );
}
