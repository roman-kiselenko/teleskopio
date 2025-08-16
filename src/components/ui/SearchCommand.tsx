import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <p className="text-muted-foreground text-xs">
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium opacity-100 select-none">
          <span className="text-xs">⌘</span>F
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput className="text-xs" placeholder="Search..." />
        <CommandList>
          <CommandEmpty className="text-xs p-2">No results found.</CommandEmpty>
        </CommandList>
      </CommandDialog>
    </>
  );
}
