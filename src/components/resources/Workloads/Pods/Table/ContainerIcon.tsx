import { useState } from 'react';
import { Container } from 'lucide-react';
import { cn } from '@/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import moment from 'moment';

function ContainerIcon({
  name,
  ready,
  containerstate,
}: {
  containerstate: any;
  name: String;
  ready: Boolean;
}) {
  let output;
  let color;
  if (containerstate && containerstate.running && containerstate.running.startedAt) {
    output = moment(containerstate.running.startedAt).fromNow();
    color = 'text-green-300';
  }
  if (containerstate && containerstate.waiting && containerstate.waiting.reason) {
    output = containerstate.waiting.reason;
    color = 'text-orange-300';
  }
  if (containerstate && containerstate.terminated && containerstate.terminated.exitCode) {
    output = containerstate.terminated.exitCode;
    color = 'text-gray-300';
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Container
          size={15}
          className={cn(
            !ready
              ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
              : '',
            `mr-2 mb-1 ${color}`,
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        "{name}"
        <span>
          {' '}
          {containerstate.waiting ? <span className="font-bold">{output}</span> : ''}
          {containerstate.running ? <span className="font-bold">{output}</span> : ''}
          {containerstate.terminated ? (
            <span>
              exited:<span className="font-bold">{output}</span>
            </span>
          ) : (
            ''
          )}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export default ContainerIcon;
