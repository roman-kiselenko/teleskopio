import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { call } from '@/lib/api';
import { Package, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
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
import { toast } from 'sonner';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [apiResource, setApiResource] = useState<ApiResource | undefined>();

  const handleSearch = async (e: string) => {
    setLoading(false);
    setSearch('');
    const res = location.pathname.replace(/resource/, '').replaceAll('/', '');
    const resource = apiResourcesState.get().find((r: ApiResource) => {
      return r.kind === res;
    });

    if (e === '') {
      setLoading(false);
    }

    if (!resource) {
      toast.warning(`Cant find resource ${res}`);
      setItems([]);
      setSearch('');
      setLoading(false);
      return;
    }

    setSearch(e);
    setApiResource(resource);

    if (e.length <= 2) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await call('search_dynamic_resource', {
      substring: e,
      request: { ...resource },
    });
    setLoading(false);
    setItems(result);
  };

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
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={search}
          onValueChange={async (e) => handleSearch(e)}
          className="text-xs"
          placeholder="Search..."
        />
        <CommandList>
          {loading && (
            <CommandLoading className="text-xs p-2">
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            </CommandLoading>
          )}
          {!loading && items.length === 0 && (
            <CommandEmpty className="text-xs p-2">No results found.</CommandEmpty>
          )}
          {items.map((i: any, index: number) => (
            <CommandItem
              key={index}
              value={i.metadata.name}
              onSelect={(currentValue: any) => {
                setOpen(false);
                const item: any = items.find((x: any) => x?.metadata.name === currentValue);
                if (!item || !apiResource) {
                  setSearch('');
                  setItems([]);
                  toast.warning(`Cant open resource`);
                  return;
                }
                setSearch('');
                setItems([]);
                navigate(
                  `/yaml/${apiResource.kind}/${item.metadata?.name}/${item?.metadata?.namespace}?group=${apiResource?.group}`,
                );
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
