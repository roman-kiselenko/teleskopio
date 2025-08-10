import { JumpCommand } from '@/components/ui/JumpCommand';
import { useVersionState } from '@/store/version';

export function Header() {
  const version = useVersionState();

  return (
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
  );
}
