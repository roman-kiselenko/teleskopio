import { JumpCommand } from '@/components/ui/JumpCommand';
import { SearchCommand } from '@/components/ui/SearchCommand';
import { useVersionState, setVersion } from '@/store/version';
import { useCurrentClusterState, setCurrentCluster } from '@/store/cluster';
import { Plus, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import { NamespaceSelector } from '@/components/NamespaceSelector';
import { toast } from 'sonner';
import { removeAllSubscriptions } from '@/lib/subscriptionManager';
import { flushAllStates } from '@/store/resources';
import { apiResourcesState } from '@/store/apiResources';
import { crdsState } from '@/store/crdResources';
import Heartbeat from '@/components/Heartbeat';

export function Header({ withNsSelector }: { withNsSelector?: Boolean }) {
  const version = useVersionState();
  const clusterState = useCurrentClusterState();
  let navigate = useNavigate();
  let location = useLocation();
  return (
    <div className="flex flex-row pt-3 pb-1 px-2 items-center justify-between text-dynamic">
      <div>
        <JumpCommand />
      </div>
      <div className="ml-2">
        <SearchCommand />
      </div>
      {location.pathname === '/createkubernetesresource' ? (
        <></>
      ) : (
        <div className="text-muted-foreground items-center flex flex-grow w-1/3">
          <div className="pl-2 flex items-center">
            <Button onClick={() => navigate('/createkubernetesresource')}>
              <Plus size={16} />
            </Button>
          </div>
        </div>
      )}
      <div className="text-muted-foreground items-center flex  justify-between"></div>
      {withNsSelector ? (
        <div className="flex flex-row pr-2">
          <NamespaceSelector />
        </div>
      ) : (
        <></>
      )}
      <div title="heartbeat" className="pr-2">
        <Heartbeat />
      </div>
      <div className="flex flex-row">
        {clusterState.context.get() === '' ? (
          <></>
        ) : (
          <p className="text-muted-foreground text-xs pr-2">
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium opacity-100 select-none">
              {clusterState.context.get()}
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
              setCurrentCluster('', '');
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
