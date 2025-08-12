import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

function PodName({ pod }: { pod: any | undefined }) {
  return (
    <div className="flex flex-row items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-row items-center p-1">
            <Info size={16} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <span className="ml-1">Node: {pod?.spec?.nodeName}</span>
        </TooltipContent>
      </Tooltip>
      <div className="flex flex-row items-center">{pod?.metadata?.name}</div>
    </div>
  );
}

export default PodName;
