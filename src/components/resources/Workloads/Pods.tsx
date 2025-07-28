import { useCurrentClusterState } from '@/store/cluster';
import { usePodsState } from '~/store/pods';
import { useSearchState } from '@/store/search';
import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import columns from '@/components/resources/Workloads/Pods/Table/ColumnDef';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Pod } from '@/types';
import toast from 'react-hot-toast';

const Pods = () => {
  const cc = useCurrentClusterState();
  const searchQuery = useSearchState();
  const podsState = usePodsState();
  const kubeConfig = cc.kube_config.get();
  const cluster = cc.cluster.get();
  const query = searchQuery.q.get();
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loadPods = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const [newPods, next]: [Pod[], string | null] = await invoke('get_pods_page', {
        path: kubeConfig,
        context: cluster,
        limit: 50,
        continueToken: nextToken ?? undefined,
      });
      podsState.set((prev) => {
        const newMap = new Map(prev);
        newPods.forEach((p) => {
          newMap.set(p.uid, p);
        });
        return newMap;
      });
      setNextToken(next);
    } catch (e: any) {
      console.error('Error! Cant fetch pods:', e);
      toast.error('Error! Cant fetch pods\n' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    invoke('start_pod_reflector', {
      path: kubeConfig,
      context: cluster,
    });
    const podsupdate = listen<Pod[]>('pods-update', (event) => {
      const pods = event.payload;
      podsState.set(() => {
        const newMap = new Map();
        pods.forEach((p) => {
          newMap.set(p.uid, p);
        });
        return newMap;
      });
    });

    return () => {
      podsupdate.then((f) => f());
    };
  }, [kubeConfig, cluster]);

  useEffect(() => {
    loadPods();
  }, []);

  useEffect(() => {
    if (!loaderRef.current || !nextToken) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && nextToken && !loading) {
        loadPods();
      }
    });

    observer.current.observe(loaderRef.current);

    return () => {
      observer.current?.disconnect();
    };
  }, [nextToken, loading]);
  return (
    <div>
      <DataTable columns={columns} data={Array.from(podsState.get().values())} />

      {nextToken && <div ref={loaderRef} style={{ height: 1, marginTop: -1 }} />}
    </div>
  );
};

export default Pods;
