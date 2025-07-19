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
  if (containerstate && containerstate.running && containerstate.running.startedAt) {
    output = `age: ${moment(containerstate.running.startedAt).fromNow()}`;
  }
  if (containerstate && containerstate.waiting && containerstate.waiting.reason) {
    output = `waiting: ${containerstate.waiting.reason}`;
  }
  if (containerstate && containerstate.terminated && containerstate.terminated.exitCode) {
    output = `exit with code: ${containerstate.terminated.exitCode}`;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Container
          color={ready ? '#1dbe5bff' : '#ff4013'}
          size={15}
          className={cn(
            !ready
              ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
              : '',
            'mr-2 mb-1',
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        "{name}"
        <span className="font-bold">
          {' '}
          {containerstate.waiting ? output : ''}
          {containerstate.running ? output : ''}
          {containerstate.terminated ? output : ''}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export default ContainerIcon;
