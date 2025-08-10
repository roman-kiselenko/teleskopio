import { JumpCommand } from '@/components/ui/JumpCommand';
import { useVersionState } from '@/store/version';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const version = useVersionState();
  let navigate = useNavigate();

  return (
    <div className="flex flex-row pt-3 px-2 items-center justify-between">
      <div className="">
        <JumpCommand />
      </div>
      <div className="text-muted-foreground items-center flex flex-grow w-full">
        <div className="pl-2">
          <Button onClick={() => navigate('/createkubernetesresource')}>
            <Plus size={16} />
          </Button>
        </div>
      </div>
      <div>
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
