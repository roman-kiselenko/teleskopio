import { ArrowBigLeft, Scroll, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { call } from '@/lib/api';
import { toast } from 'sonner';
import { listenEvent, stopLogsWatcher } from '@/lib/events';
import { logsState, useLogsState } from '@/store/logs';
import { useNavigate } from 'react-router-dom';
import { useLoaderData } from 'react-router';
import { currentClusterState } from '@/store/cluster';
import yaml from 'js-yaml';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWS } from '@/wsContext';

export function PodLogs() {
  const { name, ns, data } = useLoaderData();
  let navigate = useNavigate();
  const [podContainers, setPodContainers] = useState([]);
  const [currentContainer, setContainer] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  let logLines = useLogsState();
  const [filterText, setFilterText] = useState('');
  const { listen } = useWS();

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    if (currentContainer === '') {
      let obj = yaml.load(data);
      setPodContainers(
        obj.spec.containers
          .concat(obj.spec.initContainers)
          .concat(obj.spec.ephemeralContainer)
          .filter((c) => c),
      );
      setContainer(obj.spec.containers[0].name);
    }
    const subscribe = async () => {
      if (currentContainer === '') return;
      const logs = await call('get_pod_logs', {
        name: name,
        namespace: ns,
        container: currentContainer,
        tailLines: 100,
      });
      if (logs.message) {
        toast.error('Error! Cant ping server\n' + logs.message);
        navigate(-1);
      }
      logLines.set(
        logs.map((l) => {
          return { c: currentContainer, l: l };
        }),
      );
      const context = currentClusterState.context.get();
      unlisten = await listen(`pod_log_line_${name}_${ns}_${context}`, (payload: any) => {
        const p = payload as {
          pod: string;
          container: string;
          namespace: string;
          line: string;
        };
        if (name === p.pod && ns === p.namespace && p.container === currentContainer) {
          logLines.set((prev) => [...prev, { c: p.container, l: p.line }]);
        }
      });

      await call('stream_pod_logs', {
        name: name,
        namespace: ns,
        container: currentContainer,
      });
    };

    subscribe();

    return () => {
      if (unlisten) unlisten();
      if (currentContainer === '') return;
      stopLogsWatcher(name, ns, currentContainer);
    };
  }, [currentContainer]);

  useEffect(() => {
    if (autoScroll) {
      const el = containerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [logLines, autoScroll]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        navigate(-1);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
    setAutoScroll(atBottom);
  };
  return (
    <div className="h-screen flex flex-col">
      <div className="flex gap-2 p-1 border-b justify-items-stretch items-center">
        <Button title="back" className="text-xs bg-blue-500" onClick={() => navigate(-1)}>
          <ArrowBigLeft /> Esc
        </Button>

        <Button
          onClick={() => setAutoScroll((prev) => !prev)}
          className={`text-xs ${autoScroll ? 'bg-gray-500' : 'bg-green-500'}`}
        >
          <Scroll />
        </Button>
        <Select onValueChange={(e) => setContainer(e)} defaultValue={currentContainer}>
          <SelectTrigger size="sm" className="w-[180px] text-xs">
            <SelectValue placeholder={currentContainer} />
          </SelectTrigger>
          <SelectContent>
            {podContainers?.map((c: any) => (
              <SelectItem className="text-xs" key={c.name} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter..."
          className="w-1/6 text-xs"
        />
        <div className="flex flex-row items-center text-xs">
          <ScrollText className="mr-1" size={14} />
          <span>
            {ns}/{name}/{currentContainer}
          </span>
        </div>
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-screen overflow-y-auto text-xs p-0"
      >
        {logsState
          .get()
          .filter((l) => l.c === currentContainer)
          .filter((l) => l.l.toLowerCase().includes(filterText.toLowerCase()))
          .map((line, i) => (
            <div key={i}>{line.l}</div>
          ))}
      </div>
    </div>
  );
}
