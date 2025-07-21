import { Container as Icon } from 'lucide-react';
import { cn } from '@/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import moment from 'moment';
import { Pod, Container } from '@/components/resources/Workloads/Pods/types';

function ContainerIcon({ container, pod }: { container: Container; pod: Pod }) {
  let output = 'Unknown';
  let color = 'text-gray-400';
  let initcontainer = false;
  let blink = true;
  if (pod.spec?.initContainers?.map((c) => c.name).includes(container.name)) {
    initcontainer = true;
  }
  if (container.state?.running) {
    output = moment(container.state.running.startedAt).fromNow();
    blink = false;
    color = 'text-green-400';
  }
  if (container.state?.terminated) {
    output = `${container.state?.terminated?.reason} ${container.state?.terminated?.exitCode === 0 ? '' : container.state?.terminated?.exitCode}`;
    blink = false;
    color = 'text-red-400';
    if (container.state?.terminated?.exitCode === 0) {
      color = 'text-green-400';
    }
  }
  if (container.state?.waiting) {
    output = container.state?.waiting?.reason;
    blink = true;
    color = 'text-orange-400';
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon
          size={15}
          className={cn(
            blink
              ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
              : '',
            `mr-2 mb-1 ${color}`,
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        {initcontainer ? (
          <></>
        ) : (
          <div className="flex flex-col items-center">
            <div className="font-medium">{container.name}</div>
            <div className="font-bold">{output}</div>
          </div>
        )}
        {initcontainer ? (
          <div className="flex flex-col items-center">
            <div className="font-medium">Init: {container.name}</div>
            <div className="font-bold">{output}</div>
          </div>
        ) : (
          <></>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default ContainerIcon;
