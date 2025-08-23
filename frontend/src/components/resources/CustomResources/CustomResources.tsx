import { DataTable } from '@/components/ui/DataTable';
import { useCrsState } from '@/store/resources';
import { Loader2 } from 'lucide-react';
import columns from '@/components/resources/CustomResources/columns';
import { useEffect, useRef, useState } from 'react';
import { useLoaderData } from 'react-router';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';
import { call } from '@/lib/api';
import moment from 'moment';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

const subscribeEvents = async (rv: string, apiResource: ApiResource | undefined) => {
  const request = {
    ...apiResource,
    resource_version: rv,
  };
  await call('watch_dynamic_resource', { request });
};

const getPage = async ({
  limit,
  continueToken,
  apiResource,
}: {
  limit: number;
  continueToken?: string;
  apiResource: ApiResource | undefined;
}) => {
  return await call('list_dynamic_resource', {
    limit: limit,
    continueToken: continueToken,
    request: {
      ...apiResource,
      namespaced: false,
    },
  });
};

const getApiResource = ({
  kind,
  group,
}: {
  kind: string;
  group: string;
}): ApiResource | undefined => {
  const resource = apiResourcesState
    .get()
    .find((r: ApiResource) => r.kind === kind && r.group === group);
  if (!resource) throw new Error(`API resource for kind ${kind} and group ${group} not found`);
  return resource;
};

const CustomResources = () => {
  const { kind, group } = useLoaderData();
  const [nextToken, setNextToken] = useState<string | null>();
  const cr = useCrsState();
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadPage = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const apiResource = getApiResource({ kind, group });
      const [items, next, rv] = await getPage({
        apiResource: apiResource,
        limit: 50,
        continueToken: nextToken ?? undefined,
      });
      cr.set(() => {
        const newMap = new Map();
        items.forEach((item) => {
          newMap.set(item.metadata.uid, item);
        });
        return newMap;
      });
      await subscribeEvents(rv, apiResource);
      setNextToken(next);
    } catch (e: any) {
      console.error('Error loading page:', e);
      if (e.message) {
        toast.error(`Error loading data for table: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [cr.get()]);

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
  const data = Array.from(cr.get().values())
    .filter((x) => x.kind === kind)
    .sort((a: any, b: any) =>
      moment(b.metadata.creationTimestamp).diff(moment(a.metadata.creationTimestamp)),
    );
  const showInitialLoader = loading && data.length === 0;
  return (
    <div>
      <Header />
      {showInitialLoader && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}
      <DataTable
        key={`${kind}-${Math.random()}`}
        noResult={data.length === 0}
        columns={columns}
        data={data}
      />
      {nextToken && <div ref={loaderRef} style={{ height: 1, marginTop: -1 }} />}
      {loading && data.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default CustomResources;
