import { useState, useEffect } from 'react';
import { items } from '@/components/AppSidebar';
import { useNavigate } from 'react-router';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export function JumpCommand() {
  const [open, setOpen] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
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
          <span className="text-xs">⌘</span>J
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput className="text-xs" placeholder="Jump to..." />
        <CommandList>
          <CommandEmpty className="text-xs p-2">No results found.</CommandEmpty>
          {items.map((i, index) => (
            <CommandGroup key={index} heading={i.title}>
              {i?.url ? (
                <CommandItem
                  key={index}
                  value={i.title}
                  onSelect={(currentValue) => {
                    setOpen(false);
                    navigate(items.find((v) => v.title === currentValue)?.url as string);
                  }}
                >
                  <i.icon />
                  <span className="text-xs">{i.title}</span>
                </CommandItem>
              ) : (
                <></>
              )}
              {i.submenu.map((x, xindex) => (
                <CommandItem
                  value={x.title}
                  key={xindex}
                  onSelect={(currentValue) => {
                    setOpen(false);
                    navigate(i.submenu.find((z) => z.title === currentValue)?.url as string);
                  }}
                >
                  <x.icon />
                  <span className="text-xs">{x.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
