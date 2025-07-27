import { useEffect, useState } from 'react';
import { cn } from '@/util';

function BlinkingCell({ age }: { age: string }) {
  const [value, setValue] = useState('');
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const updateValue = () => {
      setValue(age);
    };

    updateValue();
    // const ageSeconds = moment().diff(timestamp, 'seconds');
    // if (ageSeconds < 60) {
    //   setBlink(true);
    // }
    const interval = setInterval(updateValue, 1000);
    const timeout = setTimeout(() => setBlink(false), 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [age]);

  return (
    <div
      title={''}
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
