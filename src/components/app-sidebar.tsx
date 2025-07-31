import {
  Blocks,
  Box,
  ShieldAlert,
  EthernetPort,
  Share2,
  PaintRoller,
  VenetianMask,
  SquareAsterisk,
  FileSliders,
  Network,
  GlobeLock,
  AlignJustify,
  Waypoints,
  Search,
  Package,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Menu items.
const items = [
  {
    title: 'Main',
    url: '#',
    icon: Box,
    submenu: [],
  },
  {
    title: 'Cluster',
    url: '#',
    icon: Waypoints,
    submenu: [],
  },
  {
    title: 'Workloads',
    url: '#',
    icon: Blocks,
    submenu: [
      { title: 'Pods', icon: Package },
      { title: 'Deployments', icon: Package },
      { title: 'DaemonSets', icon: Package },
      { title: 'ReplicaSets', icon: Package },
    ],
  },
  {
    title: 'Configs',
    url: '#',
    icon: Search,
    submenu: [
      { title: 'ConfigMaps', icon: FileSliders },
      { title: 'Secrets', icon: VenetianMask },
      { title: 'Namespaces', icon: SquareAsterisk },
    ],
  },
  {
    title: 'Network',
    url: '#',
    icon: Network,
    submenu: [
      { title: 'Services', icon: Share2 },
      { title: 'Ingresses', icon: EthernetPort },
      { title: 'NetworkPolicies', icon: ShieldAlert },
    ],
  },
  {
    title: 'Access',
    url: '#',
    icon: GlobeLock,
    submenu: [
      { title: 'Roles', icon: GlobeLock },
      { title: 'ServiceAccounts', icon: GlobeLock },
    ],
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings,
    submenu: [
      { title: 'Theme', icon: PaintRoller },
      { title: 'Common', icon: PaintRoller },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <Collapsible key={item.title} className="group/collapsible">
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <CollapsibleTrigger>
                      <a className="flex flex-row items-center" href={item.url}>
                        <item.icon size={16} className="mr-2" />
                        <div className="text-xs">{item.title}</div>
                      </a>
                      {item.submenu.length > 0 ? (
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      ) : (
                        <></>
                      )}
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                  <CollapsibleContent>
                    <SidebarMenuSub className="">
                      {item.submenu.map((i) => (
                        <SidebarMenuSubItem className="flex w-full" key={i.title}>
                          <button className="peer/menu-button flex flex-row w-full items-center gap-2 overflow-hidden rounded-md text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 px-2 text-xs">
                            <i.icon size={8} />
                            <div>{i.title}</div>
                          </button>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
