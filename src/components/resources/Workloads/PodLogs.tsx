import { ArrowBigLeft, Pencil, Scroll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { currentClusterState } from '@/store/cluster';
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

export function PodLogs() {
  const { name, ns, data } = useLoaderData();
  let navigate = useNavigate();
  const [podContainers, setPodContainers] = useState([]);
  const [currentContainer, setContainer] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  let logLines = useLogsState();
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    if (currentContainer === '') {
      let obj = yaml.load(data);
      setPodContainers(obj.spec.containers);
      setContainer(obj.spec.containers[0].name);
    }
    const subscribe = async () => {
      if (currentContainer === '') return;
      const logs = await invoke<string[]>('get_pod_logs', {
        path: currentClusterState.kube_config.get(),
        context: currentClusterState.cluster.get(),
        name: name,
        ns: ns,
        container: currentContainer,
        tailLines: 100,
      });
      logLines.set(
        logs.map((l) => {
          return { c: currentContainer, l: l };
        }),
      );

      unlisten = await listen('pod_log_line', (event) => {
        const payload = event.payload as {
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

      await invoke('stream_pod_logs', {
        path: currentClusterState.kube_config.get(),
        context: currentClusterState.cluster.get(),
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
    <div className="h-screen p-2 flex flex-col">
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
            {podContainers?.map((c) => (
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
        className="w-full h-screen overflow-y-auto font-mono text-xs p-0"
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
