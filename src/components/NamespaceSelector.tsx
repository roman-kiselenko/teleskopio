import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useSelectedNamespacesState } from '@/store/selectedNamespace';
import { useNamespacesState } from '@/store/resources';

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

export function NamespaceSelector() {
  const [open, setOpen] = useState(false);
  const namespaces = useNamespacesState();
  const selectedNamespace = useSelectedNamespacesState();
  const namespaceArray = [{ metadata: { name: 'all' } }].concat(
    Array.from(namespaces.get().values()),
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-7 text-muted-foreground text-sm px-2 py-1 pl-0 border-none shadow-none focus:ring-0 focus:outline-none bg-transparent text-xs w-[300px] justify-between"
        >
          {selectedNamespace.get()
            ? namespaceArray.find((ns: any) => ns.metadata.name === selectedNamespace.get())
                ?.metadata.name
            : 'Namespaces...'}
          <ChevronsUpDownIcon className="ml-2 h-2 w-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="text-xs w-[300px] p-0">
        <Command>
          <CommandInput className="text-xs" placeholder="Search namespace..." />
          <CommandList>
            <CommandEmpty className="text-center text-xs p-2">No namespace found.</CommandEmpty>
            <CommandGroup>
              {namespaceArray.map((ns: any, index: number) => (
                <CommandItem
                  className="text-xs"
                  key={index}
                  value={ns.metadata.name}
                  onSelect={(currentValue) => {
                    selectedNamespace.set(currentValue as '' | null);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-2 w-2',
                      selectedNamespace.get() === ns.metadata.name ? 'opacity-100' : 'opacity-0',
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
