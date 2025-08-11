import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { toast } from 'sonner';
import moment from 'moment';
import { Header } from '@/components/Header';
import { useVersionState } from '@/store/version';

interface PaginatedTableProps<T> {
  getPage: (args: {
    limit: number;
    continueToken?: string;
  }) => Promise<[T[], string | null, string]>;
  subscribeEvents: (rv: string) => Promise<void>;
  state: () => Map<string, T>;
  setState: (updater: (prev: Map<string, T>) => Map<string, T>) => void;
  extractKey: (item: T) => string;
  columns: any;
  withoutJump?: Boolean;
}

export function PaginatedTable<T>({
  getPage,
  subscribeEvents,
  state,
  setState,
  extractKey,
  columns,
  withoutJump,
}: PaginatedTableProps<T>) {
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadPage = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const [items, next, rv] = await getPage({
        limit: 50,
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

  const data = Array.from(state().values()).sort((a: any, b: any) =>
    moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp)),
  );
  const showInitialLoader = loading && data.length === 0;
  return (
    <div className="h-full h-screen overflow-y-auto">
      {withoutJump ? <></> : <Header />}
      {showInitialLoader && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}
      <DataTable columns={columns} data={data} />
      {nextToken && <div ref={loaderRef} style={{ height: 1, marginTop: -1 }} />}
      {loading && data.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
