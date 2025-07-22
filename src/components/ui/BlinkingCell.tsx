import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import moment from 'moment';
import { cn } from '@/util';

function BlinkingCell({
  value,
  isNew,
  timestamp,
}: {
  value: any;
  isNew: Boolean;
  timestamp: string;
}) {
  const [prevValue, setPrevValue] = useState(value);
  const [blink, setBlink] = useState(false);
  const tm = moment(timestamp).format('h:mm:ss DD/MM/YYYY');

  useEffect(() => {
    if (isNew) {
      setBlink(true);
    }
    setPrevValue(value);
    const timeout = setTimeout(() => setBlink(false), 500);
    return () => clearTimeout(timeout);
  }, [value, prevValue]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            blink
              ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
              : '',
            'flex flex-col',
          )}
        >
          <div className="w-full">{value}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">{tm}</TooltipContent>
    </Tooltip>
  );
}

export default BlinkingCell;
