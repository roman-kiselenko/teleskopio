import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

function HeaderAction({ column, name }: { column: any; name: string }) {
  return (
    <Button
      className="text-xs"
      variant="table"
      size="table"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {name}
      <ArrowUpDown className="ml-2 h-2 w-2" />
    </Button>
  );
}

export default HeaderAction;
