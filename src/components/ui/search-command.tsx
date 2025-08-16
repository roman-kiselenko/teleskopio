import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { call } from '@/lib/api';
import { Package } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';
import { pathToKind } from '@/settings';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);

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
        <CommandInput
          value={search}
          onValueChange={async (e) => {
            setLoading(true);
            const resource = apiResourcesState.get().find((r: ApiResource) => {
              return pathToKind(location.pathname) === r.kind;
            });
            setItems(
              await call('search_dynamic_resource', {
                substring: e,
                request: { ...resource },
              }),
            );
            setLoading(false);
            setSearch(e);
          }}
          className="text-xs"
          placeholder="Search..."
        />
        <CommandList>
          {loading && <CommandLoading>Hang on…</CommandLoading>}
          <CommandEmpty className="text-xs p-2">No results found.</CommandEmpty>
          {items.map((i: any, index: number) => (
            <CommandItem
              key={index}
              value={i.metadata.name}
              onSelect={(currentValue) => {
                setOpen(false);
                console.log(currentValue);
                setItems([]);
              }}
            >
              <Package />
              <span className="text-xs">{i.metadata.name}</span>
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
