import { RefreshCw } from 'lucide-react';
import { cn } from '@/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function PodStatus({ pod }: { pod: any }) {
  let phase = pod.status?.phase ?? 'Unknown';
  let color = 'text-green-500';
  let blink = false;
  if (pod.metadata?.deletionTimestamp) {
    phase = 'Terminating';
    color = 'text-gray-300';
    blink = true;
  }
  if (phase === 'Failed') {
    color = 'text-red-500';
  } else if (phase === 'Pending') {
    color = 'text-orange-500';
    blink = true;
  } else if (phase === 'Evicted') {
    color = 'text-gray-500';
  } else if (phase === 'Succeeded') {
    color = 'text-green-600';
  }
  const restarts = `${pod.status?.containerStatuses?.length} / ${pod.status?.containerStatuses?.reduce(
    (acc, curr) => {
      return curr.ready ? acc + 1 : acc;
    },
    0,
  )}`;
  return (
    <div className="flex flex-row items-center">
      {pod.status?.containerStatuses?.length ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                blink
                  ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
                  : '',
                `${color}`,
              )}
            >
              {phase}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-row items-center">
              <RefreshCw size={14} />
              <span className="ml-1">{restarts}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span
          className={cn(
            blink
              ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
              : '',
            `${color}`,
          )}
        >
          {phase}
        </span>
      )}
    </div>
  );
}

export default PodStatus;
