import { usePageState } from '@/store/page';

export function Workloads() {
  const currentPage = usePageState();

  return (
    <div className="flex flex-col w-35 border-r border-gray-300">
      <button className="relative text-sm focus:outline-none group">
        <div className="flex items-center justify-between w-full h-12 px-3 border-b border-gray-300 hover:bg-blue-300">
          <span className="font-medium">Workloads</span>
        </div>
      </button>
      <div className="flex flex-col flex-grow p-2 overflow-auto">
        <a
          className={`flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300 ${
            currentPage.currentPage.get() === 'pods' ? 'bg-blue-100' : ''
          }`}
          href="#"
          onClick={() => currentPage.currentPage.set('pods')}
        >
          <span className="leading-none">Pods</span>
        </a>
        <a
          className={`flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300 ${
            currentPage.currentPage.get() === 'deployments' ? 'bg-blue-100' : ''
          }`}
          href="#"
          onClick={() => currentPage.currentPage.set('deployments')}
        >
          <span className="leading-none">Deployments</span>
        </a>
        <a
          className={`flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300 ${
            currentPage.currentPage.get() === 'daemonsets' ? 'bg-blue-100' : ''
          }`}
          href="#"
          onClick={() => currentPage.currentPage.set('daemonsets')}
        >
          <span className="leading-none">DaemonSets</span>
        </a>
        <a
          className={`flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300 ${
            currentPage.currentPage.get() === 'replicasets' ? 'bg-blue-100' : ''
          }`}
          href="#"
          onClick={() => currentPage.currentPage.set('replicasets')}
        >
          <span className="leading-none">ReplicaSets</span>
        </a>
        <a
          className={`flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300 ${
            currentPage.currentPage.get() === 'statefulsets' ? 'bg-blue-100' : ''
          }`}
          href="#"
          onClick={() => currentPage.currentPage.set('statefulsets')}
        >
          <span className="leading-none">StatefulSets</span>
        </a>
        <a
          className={`flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300 ${
            currentPage.currentPage.get() === 'jobs' ? 'bg-blue-100' : ''
          }`}
          href="#"
          onClick={() => currentPage.currentPage.set('jobs')}
        >
          <span className="leading-none">Jobs</span>
        </a>
        <a
          className={`flex items-center flex-shrink-0 h-7 px-1 text-xs font-medium rounded hover:bg-blue-300 ${
            currentPage.currentPage.get() === 'cronjobs' ? 'bg-blue-100' : ''
          }`}
          href="#"
          onClick={() => currentPage.currentPage.set('cronjobs')}
        >
          <span className="leading-none">CronJobs</span>
        </a>
      </div>
    </div>
  );
}
