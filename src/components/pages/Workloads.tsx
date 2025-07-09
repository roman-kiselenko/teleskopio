import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import Pods from '~/components/resources/Workloads/Pods';

export function WorkloadsPage() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center flex-shrink-0 h-12 border-b border-gray-300">
        <button className="relative text-sm focus:outline-none group">
          <div className="flex items-center justify-between w-full h-12 px-2 hover:bg-blue-300">
            <span className="font-medium">
              {cc.cluster.get()}:{cv.version.get()}
            </span>
          </div>
        </button>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          <Pods />
        </div>
      </div>
    </div>
  );
}
