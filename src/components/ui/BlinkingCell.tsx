import { useEffect, useState } from 'react';
import moment from 'moment';
import { cn } from '@/util';

function BlinkingCell({ timestamp }: { timestamp: string }) {
  const [value, setValue] = useState('');
  const [blink, setBlink] = useState(false);
  const tm = moment(timestamp).format('h:mm:ss DD/MM/YYYY');

  useEffect(() => {
    const updateValue = () => {
      setValue(moment(timestamp).fromNow());
    };

    updateValue();
    const ageSeconds = moment().diff(timestamp, 'seconds');
    if (ageSeconds < 60) {
      setBlink(true);
    }
    const interval = setInterval(updateValue, 1000);
    const timeout = setTimeout(() => setBlink(false), 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [timestamp]);

  return (
    <div
      title={tm}
      className={cn(
        blink
          ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
          : '',
        'flex flex-col',
      )}
    >
      <div className="w-full">{value}</div>
    </div>
  );
}

export default BlinkingCell;
