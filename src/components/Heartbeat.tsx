import { useEffect, useState } from 'react';
import { Dot } from 'lucide-react'; // https://lucide.dev/icons/circle
import { call } from '@/lib/api';

export default function Heartbeat() {
  const [status, setStatus] = useState<'ok' | 'fail'>('fail');
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        call('heartbeat', {});
        if (isMounted) setStatus('ok');
      } catch {
        if (isMounted) setStatus('fail');
      }
    };

    checkBackend();
    const timer = setInterval(checkBackend, 5000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Мигалка
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkTimer);
  }, []);

  const color =
    status === 'ok'
      ? blink
        ? 'text-green-500'
        : 'text-green-300'
      : blink
        ? 'text-red-500'
        : 'text-red-300';

  return <Dot className={`w-6 h-6 ${color}`} />;
}
