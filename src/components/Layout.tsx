import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Workloads } from './resources/Workloads/Workloads';
import { Configs } from './resources/Configs/Configs';
import { Network } from './resources/Network/Network';
import { Storage } from './resources/Storage';
import { Access } from './resources/Access';
import { Settings } from './resources/Settings';
import { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';

export function Layout() {
  const currentPath = useLocation();
  const isStartPage = useMemo(() => currentPath.pathname === '/', [currentPath]);
  const isWorkloads = useMemo(() => currentPath.pathname === '/workloads', [currentPath]);
  const isConfig = useMemo(() => currentPath.pathname === '/config', [currentPath]);
  const isNetwork = useMemo(() => currentPath.pathname === '/network', [currentPath]);
  const isStorage = useMemo(() => currentPath.pathname === '/storage', [currentPath]);
  const isAccess = useMemo(() => currentPath.pathname === '/access', [currentPath]);
  const isSettings = useMemo(() => currentPath.pathname === '/settings', [currentPath]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="teleskopio-ui-theme">
      <div className="grid">
        <div className="flex w-screen h-screen text-foreground-700">
          <Sidebar />
          {!isStartPage && isWorkloads ? <Workloads /> : <></>}
          {!isStartPage && isConfig ? <Configs /> : <></>}
          {!isStartPage && isNetwork ? <Network /> : <></>}
          {!isStartPage && isStorage ? <Storage /> : <></>}
          {!isStartPage && isAccess ? <Access /> : <></>}
          {!isStartPage && isSettings ? <Settings /> : <></>}
          <Outlet />
        </div>
        <Toaster
          toastOptions={{ className: '!font-medium !text-xs' }}
          containerStyle={{
            top: 20,
            left: 20,
            bottom: 20,
            right: 20,
          }}
          position="bottom-right"
          reverseOrder={false}
        />
      </div>
    </ThemeProvider>
  );
}
