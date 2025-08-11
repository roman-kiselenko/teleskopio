import { JumpCommand } from '@/components/ui/JumpCommand';
import { useVersionState } from '@/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';

export function Header() {
  const version = useVersionState();
  const clusterState = useCurrentClusterState();
  let navigate = useNavigate();
  let location = useLocation();

  return (
    <div className="flex flex-row pt-3 px-2 items-center justify-between">
      <div className="">
        <JumpCommand />
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
      <div className="flex flex-row">
        {clusterState.context.get() === '' ? (
          <></>
        ) : (
          <p className="text-muted-foreground text-xs pr-1">
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
    </div>
  );
}
