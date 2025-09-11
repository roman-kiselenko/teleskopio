import { JumpCommand } from '@/components/ui/jump-command';
import { useVersionState, setVersion } from '@/store/version';
import { useCurrentClusterState, setCurrentCluster } from '@/store/cluster';
import { Plus, Unplug } from 'lucide-react';
import { useSearchState } from '@/store/search';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { NamespaceSelector } from '@/components/NamespaceSelector';
import { toast } from 'sonner';
import { removeAllSubscriptions } from '@/lib/subscriptionManager';
import { flushAllStates } from '@/store/resources';
import { apiResourcesState } from '@/store/apiResources';
import { crdsState } from '@/store/crdResources';
import { Input } from '@/components/ui/input';

export function Header({ withNsSelector }: { withNsSelector?: boolean }) {
  const version = useVersionState();
  const clusterState = useCurrentClusterState();
  const searchQuery = useSearchState();
  let navigate = useNavigate();
  let location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [user] = useState(() => {
    return JSON.parse(localStorage.getItem('user') || '{}');
  });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-row py-2 px-2 border-b items-center justify-between sticky top-0 z-10 bg-background">
      {location.pathname === '/createkubernetesresource' ? (
        <></>
      ) : (
        <div className="text-muted-foreground items-center flex flex-grow w-1/3">
          <div className="flex items-center">
            <Button className="text-xs" onClick={() => navigate('/createkubernetesresource')}>
              <Plus size={16} /> Create
            </Button>
          </div>
        </div>
      )}
      <div>
        <JumpCommand />
      </div>
      <div className="flex flex-row px-2 items-center">
        <Input
          ref={inputRef}
          placeholder="Filter by name..."
          className="placeholder:text-muted-foreground flex h-7 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => searchQuery.q.set(e.target.value)}
        />
      </div>
      <div className="text-muted-foreground items-center flex  justify-between"></div>
      {withNsSelector ? (
        <div className="flex flex-row pr-2">
          <NamespaceSelector />
        </div>
      ) : (
        <></>
      )}
      <div className="flex flex-row">
        {user?.role ? (
          <p className="text-muted-foreground text-xs pr-2">
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium opacity-100 select-none">
              {user.role}
            </kbd>
          </p>
        ) : (
          <></>
        )}
        {clusterState.server.get() === '' ? (
          <></>
        ) : (
          <p className="text-muted-foreground text-xs pr-2">
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium opacity-100 select-none">
              {clusterState.server.get()}
            </kbd>
          </p>
        )}
        {version.version.get() === '' ? (
          <></>
        ) : (
          <p className="text-muted-foreground text-xs">
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium opacity-100 select-none">
              {version.version.get()}
            </kbd>
          </p>
        )}
      </div>
      <div className="text-muted-foreground">
        <div className="pl-2 flex items-center">
          <Button
            title="disconnect cluster"
            className="bg-red-500 hover:bg-red-400"
            onClick={() => {
              toast.warning(<div>Disconnect cluster</div>);
              setCurrentCluster('');
              setVersion('');
              apiResourcesState.set([]);
              crdsState.set(new Map<string, any>());
              flushAllStates();
              removeAllSubscriptions();
              navigate('/');
            }}
          >
            <Unplug className="" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
