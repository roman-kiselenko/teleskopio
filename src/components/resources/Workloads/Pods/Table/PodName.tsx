import { Info } from 'lucide-react';
import { cn } from '@/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function PodName({ name, nodeName }: { nodeName: any; name: String }) {
  return (
    <div className="flex flex-row items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Info size={15} className={cn(`mr-1 min-w-4 text-gray-400`)} />
        </TooltipTrigger>
        <TooltipContent>{nodeName}</TooltipContent>
      </Tooltip>
      {name}
    </div>
  );
}

export default PodName;
