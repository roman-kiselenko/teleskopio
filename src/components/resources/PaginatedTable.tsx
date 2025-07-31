import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import toast from 'react-hot-toast';
import { useCurrentClusterState } from '@/store/cluster';

interface PaginatedTableProps<T> {
  getPage: (args: {
    path: string;
    context: string;
    continueToken?: string;
  }) => Promise<[T[], string | null, string]>;
  subscribeEvents: (rv: string) => Promise<void>;
  state: () => Map<string, T>;
  setState: (updater: (prev: Map<string, T>) => Map<string, T>) => void;
  extractKey: (item: T) => string;
  columns: any;
}

export function PaginatedTable<T>({
  getPage,
  subscribeEvents,
  state,
  setState,
  extractKey,
  columns,
}: PaginatedTableProps<T>) {
  const cc = useCurrentClusterState();
  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadPage = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const [items, next, rv] = await getPage({
        path: kubeConfig,
        context: cluster,
        continueToken: nextToken ?? undefined,
      });
      setState((prev) => {
        const newMap = new Map(prev);
        items.forEach((item) => {
          newMap.set(extractKey(item), item);
        });
        return newMap;
      });
      await subscribeEvents(rv);
      setNextToken(next);
    } catch (e: any) {
      console.error('Error loading page:', e);
      toast.error('Error loading page\n' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (!loaderRef.current || !nextToken) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && nextToken && !loading) {
        loadPage();
      }
    });

    observer.current.observe(loaderRef.current);
    return () => observer.current?.disconnect();
  }, [nextToken, loading]);

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          <DataTable columns={columns} data={Array.from(state().values())} />
          {nextToken && <div ref={loaderRef} style={{ height: 1, marginTop: -1 }} />}
        </div>
      </div>
    </div>
  );
}
