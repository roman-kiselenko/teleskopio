import { RefreshCw } from 'lucide-react';
import { cn } from '@/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Pod } from '@/types';

function PodStatus({ pod }: { pod: Pod }) {
  let phase = pod.status.phase ?? 'Unknown';
  let color = 'text-green-500';
  let blink = false;
  if (pod.metadata.deletionTimestamp) {
    phase = 'Terminating';
    color = 'text-gray-300';
    blink = true;
  } else if (phase === 'Failed') {
    color = 'text-red-500';
  } else if (phase === 'Pending') {
    color = 'text-orange-500';
    blink = true;
  } else if (phase === 'Evicted') {
    color = 'text-gray-500';
  } else if (phase === 'Succeeded') {
    color = 'text-green-600';
  }
  let containers = pod.status?.containerStatuses ? pod.status?.containerStatuses : [];
  if (pod.status?.initContainerStatuses) {
    containers.concat(pod.status.initContainerStatuses);
  }
  if (pod.status?.ephemeralContainerStatuses) {
    containers.concat(pod.status.ephemeralContainerStatuses);
  }
  const restarts = `${containers.length} / ${containers.reduce((acc, curr) => {
    return curr.ready ? acc + 1 : acc;
  }, 0)}`;
  const className = cn(
    blink
      ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
      : '',
    `${color}`,
  );
  return (
    <div className="flex flex-row items-center">
      {containers.length && !pod.metadata.deletionTimestamp ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={className}>{phase}</span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-row items-center">
              <RefreshCw size={14} />
              <span className="ml-1">{restarts}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className={className}>{phase}</span>
      )}
    </div>
  );
}

export default PodStatus;
