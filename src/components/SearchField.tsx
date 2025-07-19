import { useSearchState, setSearchQuery } from '@/store/search';
import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

export function SearchField() {
  const searchQuery = useSearchState();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex items-center justify-between w-full h-12 px-2">
      <div className="flex items-center py-2">
        <Input
          ref={inputRef}
          placeholder="Search..."
          value={searchQuery.q.get()}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="text-xs max-w-xs pl-0 w-[200px]"
        />
      </div>
    </div>
  );
}
