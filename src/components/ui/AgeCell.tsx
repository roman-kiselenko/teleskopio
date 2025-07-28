import { useEffect, useState } from 'react';
import timeAgo from '@/timeAgo';
import moment from 'moment';

function AgeCell({ age }: { age: string }) {
  const [value, setValue] = useState(age);

  useEffect(() => {
    const updateValue = () => {
      setValue(timeAgo.format(moment(age).toDate(), 'mini'));
    };

    updateValue();
    const interval = setInterval(updateValue, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [age]);

  return (
    <div title={''} className={'flex flex-col'}>
      <div className="w-full">{value}</div>
    </div>
  );
}

export default AgeCell;
