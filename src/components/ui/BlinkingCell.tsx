import { useEffect, useState } from 'react';

function BlinkingCell({ value, isNew }: { value: any; isNew: Boolean }) {
  const [prevValue, setPrevValue] = useState(value);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (isNew) {
      setBlink(true);
    }
    setPrevValue(value);
    const timeout = setTimeout(() => setBlink(false), 500);
    return () => clearTimeout(timeout);
  }, [value, prevValue]);

  return (
    <div
      className={
        blink
          ? 'animate-pulse animate-infinite animate-duration-[500ms] animate-ease-out animate-fill-both'
          : ''
      }
    >
      {value}
    </div>
  );
}

export default BlinkingCell;
