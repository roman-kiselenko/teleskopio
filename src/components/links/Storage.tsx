import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

export function StorageLink() {
  const children = (
    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-3 rounded hover:bg-blue-300">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="rounded-lg px-4 h-8 relative
              flex items-center justify-center text-sm cursor-pointer text-foreground gap-2 hover:bg-muted/50 transition-colors"
            >
              <FontAwesomeIcon icon={faDatabase} size="lg" className="" />
            </div>
          </TooltipTrigger>
          <TooltipContent sideOffset={0}>storage</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <NavLink to="/storage" className="cursor-pointer rounded flex flex-col items-center">
      {children}
    </NavLink>
  );
}
