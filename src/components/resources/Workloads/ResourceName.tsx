import { Info } from 'lucide-react';
import { cn } from '@/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function ResourceName({ name, content }: { content: any; name: String }) {
  return (
    <div className="flex flex-row items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Info size={15} className={cn(`mr-1 min-w-4 text-gray-400`)} />
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
      {name}
    </div>
  );
}

export default ResourceName;
