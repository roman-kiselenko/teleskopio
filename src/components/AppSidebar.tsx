import {
  Blocks,
  Box,
  ShieldAlert,
  EthernetPort,
  Telescope,
  Share2,
  PaintRoller,
  VenetianMask,
  SquareAsterisk,
  FileSliders,
  Network,
  GlobeLock,
  PersonStanding,
  AlignJustify,
  Waypoints,
  Search,
  Package,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useVersionState } from '~/store/version';
import { useCurrentClusterState } from '@/store/cluster';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/util';

const items = [
  {
    title: 'Main',
    url: '/',
    icon: Box,
    submenu: [],
  },
  {
    title: 'Cluster',
    url: '/cluster',
    icon: Waypoints,
    submenu: [],
  },
  {
    title: 'Workloads',
    icon: Blocks,
    submenu: [
      { title: 'Pods', icon: Package, url: '/pods' },
      { title: 'Deployments', icon: Package, url: '/deployments' },
      { title: 'DaemonSets', icon: Package, url: '/daemonsets' },
      { title: 'ReplicaSets', icon: Package, url: '/replicasets' },
      { title: 'StatefulSets', icon: Package, url: '/statefulsets' },
      { title: 'Jobs', icon: Package, url: '/jobs' },
      { title: 'CronJobs', icon: Package, url: '/cronjobs' },
    ],
  },
  {
    title: 'Configs',
    icon: Search,
    submenu: [
      { title: 'ConfigMaps', icon: FileSliders, url: '/configmaps' },
      { title: 'Secrets', icon: VenetianMask, url: '/secrets' },
      { title: 'Namespaces', icon: SquareAsterisk, url: '/namespaces' },
    ],
  },
  {
    title: 'Network',
    icon: Network,
    submenu: [
      { title: 'Services', icon: Share2, url: '/services' },
      { title: 'Ingresses', icon: EthernetPort, url: '/ingresses' },
      { title: 'NetworkPolicies', icon: ShieldAlert, url: '/networkpolicies' },
    ],
  },
  {
    title: 'Access',
    icon: GlobeLock,
    submenu: [
      { title: 'Roles', icon: PersonStanding, url: '/roles' },
      { title: 'ServiceAccounts', icon: GlobeLock, url: '/serviceaccounts' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    submenu: [
      { title: 'Theme', icon: PaintRoller, url: '/themes' },
      { title: 'Common', icon: PaintRoller, url: '/common' },
    ],
  },
];

export function AppSidebar() {
  const cv = useVersionState();
  const cc = useCurrentClusterState();
  let location = useLocation();
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarTrigger className="p-4" title="collapse" />
            {items.map((item) => (
              <Collapsible key={item.title} className="group/collapsible">
                <SidebarMenuItem
                  className={
                    item.title !== 'Main' && item.title !== 'Settings' && cc.cluster.get() === ''
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                  key={item.title}
                >
                  {item?.url ? (
                    <SidebarMenuButton isActive={location.pathname === item?.url}>
                      <NavLink to={item.url} className="flex flex-row items-center">
                        <item.icon size={16} className="mr-2" />
                        <div className="text-xs">{item.title}</div>
                      </NavLink>
                    </SidebarMenuButton>
                  ) : (
                    <CollapsibleTrigger className="w-full">
                      <SidebarMenuButton>
                        <div className="flex flex-row items-center">
                          <item.icon size={16} className="mr-2" />
                          <div className="text-xs">{item.title}</div>
                        </div>
                        <ChevronDown
                          size={20}
                          className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  )}
                  <CollapsibleContent>
                    <SidebarMenuSub className="gap-0">
                      {item.submenu.map((i) => (
                        <SidebarMenuSubItem className="flex w-full" key={i.title}>
                          <SidebarMenuButton isActive={location.pathname === i?.url} asChild>
                            <NavLink
                              to={i.url}
                              className="peer/menu-button flex flex-row w-full items-center gap-0 overflow-hidden rounded-md text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 px-2 text-xs !gap-0"
                            >
                              <i.icon size={16} className="mr-2" />
                              <div className="text-xs">{i.title}</div>
                            </NavLink>
                          </SidebarMenuButton>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex flex-row items-center ms:invisible">
                <Telescope size={16} className="mr-2" />
                <a href="#" className={cn('text-xs', state === 'collapsed' ? 'hidden' : '')}>
                  telekopio v0.0.1
                </a>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
