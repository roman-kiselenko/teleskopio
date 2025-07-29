import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { usePageState, setPage } from '@/store/page';
import { SearchField } from '~/components/SearchField';
import Pods from '@/components/resources/Workloads/Pods';
import DaemonSets from '@/components/resources/Workloads/DaemonSets';
import Deployments from '@/components/resources/Workloads/Deployments';
import ReplicaSets from '@/components/resources/Workloads/ReplicaSets';
import StatefulSets from '@/components/resources/Workloads/StatefulSets';
import Jobs from '@/components/resources/Workloads/Jobs';
import CronJobs from '@/components/resources/Workloads/CronJobs';
import { Namespaces } from '~/components/Namespaces';
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
          {currentPage.currentPage.get() === 'deployments' ? <Deployments /> : <></>}
          {currentPage.currentPage.get() === 'replicasets' ? <ReplicaSets /> : <></>}
          {currentPage.currentPage.get() === 'statefulsets' ? <StatefulSets /> : <></>}
          {currentPage.currentPage.get() === 'jobs' ? <Jobs /> : <></>}
          {currentPage.currentPage.get() === 'cronjobs' ? <CronJobs /> : <></>}
        </div>
      </div>
    </div>
  );
}
