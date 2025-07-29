import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { usePageState, setPage } from '@/store/page';
import { SearchField } from '~/components/SearchField';
import Pods from '@/components/resources/Workloads/Pods';
import DaemonSets from '@/components/resources/Workloads/DaemonSets';
// import Pods from '~/components/resources/Workloads/Pods';
import { Namespaces } from '~/components/Namespaces';
import { useEffect } from 'react';

import { useDeploymentState, getDeployments } from '@/store/deployments';
// import { useDaemonSetsState, getDaemonSets } from '@/store/daemonsets';
import { useReplicaSetsState, getReplicaSets } from '@/store/replicasets';
import { useStatefulSetsState, getStatefulSets } from '@/store/statefulsets';
import { useJobsState, getJobs } from '@/store/jobs';
import { useCronJobsState, getCronJobs } from '@/store/cronjobs';
import deploymnetsColumns from '@/components/resources/Workloads/columns/Deployments';
import daemonsetsColumns from '@/components/resources/Workloads/columns/DaemonSets';
import replicasetsColumns from '@/components/resources/Workloads/columns/ReplicaSets';
import statefulsetsColumns from '@/components/resources/Workloads/columns/StatefulSets';
import jobsColumns from '@/components/resources/Workloads/columns/Jobs';
import cronJobsColumns from '@/components/resources/Workloads/columns/CronJobs';

export function WorkloadsPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  const currentPage = usePageState();

  const deploymentsState = useDeploymentState();
  // const daemonSetsState = useDaemonSetsState();
  const replicaSetsState = useReplicaSetsState();
  const statefulSetsState = useStatefulSetsState();
  const jobsState = useJobsState();
  const cronJobsState = useCronJobsState();

  useEffect(() => {
    setPage('pods');
  }, ['pods']);

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
          {currentPage.currentPage.get() === 'pods' ? <Pods /> : <></>}
          {currentPage.currentPage.get() === 'daemonsets' ? <DaemonSets /> : <></>}
          {/* {currentPage.currentPage.get() === 'deployments' ? (
            <AbstractPage
              getData={getDeployments}
              state={() => Array.from(deploymentsState.get().values())}
              columns={deploymnetsColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'daemonsets' ? (
            <AbstractPage
              getData={getDaemonSets}
              state={() => Array.from(daemonSetsState.get().values())}
              columns={daemonsetsColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'replicasets' ? (
            <AbstractPage
              getData={getReplicaSets}
              state={() => Array.from(replicaSetsState.get().values())}
              columns={replicasetsColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'statefulsets' ? (
            <AbstractPage
              getData={getStatefulSets}
              state={() => Array.from(statefulSetsState.get().values())}
              columns={statefulsetsColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'jobs' ? (
            <AbstractPage
              getData={getJobs}
              state={() => Array.from(jobsState.get().values())}
              columns={jobsColumns}
            />
          ) : (
            <></>
          )}
          {currentPage.currentPage.get() === 'cronjobs' ? (
            <AbstractPage
              getData={getCronJobs}
              state={() => Array.from(cronJobsState.get().values())}
              columns={cronJobsColumns}
            />
          ) : (
            <></>
          )} */}
        </div>
      </div>
    </div>
  );
}
