import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useCurrentClusterState } from '@/store/cluster';
import { useNamespacesState, getNamespaces } from '@/store/namespaces';
import { useEffect } from 'react';

import { cn } from '@/util';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Namespaces() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const cc = useCurrentClusterState();
  const ns = useNamespacesState();

  useEffect(() => {
    getNamespaces(cc.kube_config.get(), cc.cluster.get());
  }, [cc.kube_config.get(), cc.cluster.get()]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-7 text-muted-foreground text-sm px-2 py-1 pl-0 border-none shadow-none focus:ring-0 focus:outline-none bg-transparent text-xs w-[200px] justify-between"
        >
          {value
            ? ns.namespaces
                .get()
                .slice()
                .find((ns: any) => ns.metadata.name === value)?.metadata.name
            : 'Namespace...'}
          <ChevronsUpDownIcon className="ml-2 h-2 w-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="text-xs w-[200px] p-0">
        <Command>
          <CommandInput className="text-xs" placeholder="Search namespace..." />
          <CommandList>
            <CommandEmpty>No namespace found.</CommandEmpty>
            <CommandGroup>
              {ns.namespaces.get().map((ns: any, index: number) => (
                <CommandItem
                  className="text-xs"
                  key={index}
                  value={ns.metadata.name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-2 w-2',
                      value === ns.metadata.name ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {ns.metadata.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
