import { usePageState, setPage } from '@/store/page';
import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { Namespaces } from '~/components/Namespaces';
import { SearchField } from '~/components/SearchField';
// import { AbstractPage } from '@/components/resources/PaginatedTable';
import { useServicesState, getServices } from '~/store/services';
import { useNetworkPoliciesState, getNetworkPolicies } from '~/store/networkpolicies';
import { useIngressesState, getIngresses } from '~/store/ingresses';

import { useEffect } from 'react';
import servicesColumns from '@/components/resources/Network/columns/Services';
import ingressesColumns from '@/components/resources/Network/columns/Ingresses';
import networkpoliciesColumns from '@/components/resources/Network/columns/NetworkPolicies';

export function NetworkPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();

  const servicesState = useServicesState();
  const npState = useNetworkPoliciesState();
  const ingressesState = useIngressesState();

  useEffect(() => {
    setPage('services');
  }, ['services']);

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
        <div className="relative focus:outline-none group">
          <div className="flex items-center w-full h-12 px-4">
            <Namespaces />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          {/* {currentPage.currentPage.get() === 'services' ? (
            <AbstractPage
              getData={getServices}
              state={() => Array.from(servicesState.get().values())}
              columns={servicesColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'ingresses' ? (
            <AbstractPage
              getData={getIngresses}
              state={() => Array.from(ingressesState.get().values())}
              columns={ingressesColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'networkpolicies' ? (
            <AbstractPage
              getData={getNetworkPolicies}
              state={() => Array.from(npState.get().values())}
              columns={networkpoliciesColumns}
            />
          ) : (
            <></>
          )} */}
        </div>
      </div>
    </div>
  );
}
