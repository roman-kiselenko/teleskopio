import { Container as Icon } from 'lucide-react';
import { cn } from '@/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ContainerStatus } from '@/types';
import timeAgo from '@/timeAgo';
import moment from 'moment';
import { useEffect, useState } from 'react';

function ContainerIcon({ container }: { container: ContainerStatus }) {
  const [value, setValue] = useState(container.state?.running?.startedAt);
  useEffect(() => {
    const updateValue = () => {
      if (container.state?.running?.startedAt) {
        setValue(timeAgo.format(moment(container.state?.running.startedAt).toDate(), 'mini'));
      }
    };
    updateValue();
    const interval = setInterval(updateValue, 1000);
    return () => clearInterval(interval);
  }, [container.state?.running?.startedAt]);

  let output = 'Unknown';
  let color = 'text-gray-400';
  let initcontainer = false;
  let ephemeralcontainer = false;
  let blink = true;
  if (container.containerType === 'Init') {
    initcontainer = true;
  }
  if (container.containerType === 'Ephemeral') {
    ephemeralcontainer = true;
  }
  if (container.state.running) {
    output = value;
    blink = false;
    color = 'text-green-400';
  }
  if (container.state.terminated) {
    output = `${container.state.terminated.reason} ${container.state.terminated.exitCode === 0 ? '' : container.state.terminated.exitCode}`;
    blink = false;
    color = 'text-red-400';
    if (container.state.terminated.exitCode === 0) {
      color = 'text-green-400';
    }
  }
  if (container.state.waiting) {
    output = container.state.waiting.reason;
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
