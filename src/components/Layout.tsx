import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SearchField } from '@/components/SearchField';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export default function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="teleskopio-ui-theme">
      <div className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full">
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
        <main className="bg-background relative flex w-full flex-col">
          <div className="flex flex-col w-full border-b border-gray-300">
            <SearchField />
          </div>
          <Outlet />
        </main>
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
