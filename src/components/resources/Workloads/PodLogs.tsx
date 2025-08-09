import { ArrowBigLeft, Pencil, Scroll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { call } from '@/lib/api';
import { listenEvent } from '@/lib/events';
import { logsState, useLogsState } from '@/store/logs';
import { useNavigate } from 'react-router-dom';
import { useLoaderData } from 'react-router';
import yaml from 'js-yaml';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JumpCommand } from '@/components/ui/JumpCommand';
import { useVersionState } from '@/store/version';

export function PodLogs() {
  const { name, ns, data } = useLoaderData();
  let navigate = useNavigate();
  const [podContainers, setPodContainers] = useState([]);
  const [currentContainer, setContainer] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  let logLines = useLogsState();
  const [filterText, setFilterText] = useState('');
  const version = useVersionState();

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
      logLines.set(
        logs.map((l) => {
          return { c: currentContainer, l: l };
        }),
      );

      unlisten = await listenEvent('pod_log_line', (ev: any) => {
        const payload = ev as {
          pod: string;
          container: string;
          namespace: string;
          line: string;
        };
        if (
          name === payload.pod &&
          ns === payload.namespace &&
          payload.container === currentContainer
        ) {
          logLines.set((prev) => [...prev, { c: payload.container, l: payload.line }]);
        }
      });

      await call('stream_pod_logs', {
        name: name,
        ns: ns,
        container: currentContainer,
      });
    };

    subscribe();

    return () => {
      if (unlisten) unlisten();
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

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
    setAutoScroll(atBottom);
  };
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-row justify-between">
        <div>
          <JumpCommand />
        </div>
        <div>
          {version.version.get() === '' ? (
            <></>
          ) : (
            <p className="text-muted-foreground p-2 pt-3.5 text-xs">
              <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium opacity-100 select-none">
                {version.version.get()}
              </kbd>
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 p-1 border-b justify-items-stretch items-center">
        <Button title="back" className="text-xs bg-blue-500" onClick={() => navigate(-1)}>
          <ArrowBigLeft />
        </Button>
        <Button className="text-xs">
          <Pencil />
          {ns}/{name}/{currentContainer}
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
          className="text-xs"
        />
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
