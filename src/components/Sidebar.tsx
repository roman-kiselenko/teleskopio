import k8sLogo from "./icons/k8s.svg";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip'

import { NavLink } from 'react-router-dom'

import { ClusterLink } from './links/Cluster.tsx'
import { WorkloadsLink } from './links/Workloads.tsx'
import { ConfigLink } from './links/Config.tsx'
import { NetworkLink } from './links/Network.tsx'
import { StorageLink } from './links/Storage.tsx'
import { AccessLink } from './links/Access.tsx'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

export function Sidebar() {
  return (
    <div className="flex flex-col items-center w-16 pb-4 overflow-auto border-r border-gray-300">
        <NavLink to="/" className="flex items-center justify-center flex-shrink-0 w-full h-12 bg-blue-300">
           <img src={k8sLogo} className="w-7 h-7" alt="Kubernetes" />
        </NavLink>
        <ClusterLink />
        <WorkloadsLink />
        <ConfigLink />
        <NetworkLink />
        <StorageLink />
        <AccessLink />
        <NavLink to="/settings" className="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-3 mt-auto rounded hover:bg-blue-300">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-lg px-4 h-8 relative
                  flex items-center justify-center text-sm cursor-pointer text-foreground gap-2 hover:bg-muted/50 transition-colors">
                    <FontAwesomeIcon icon={faGear} size="lg" className="" />
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={0}>
                settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </NavLink>
    </div>
  )
}