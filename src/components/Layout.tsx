import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useTheme } from '@/components/ThemeProvider';

export default function Layout() {
  const { theme } = useTheme();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="teleskopio-ui-theme">
      <div className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full">
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
        <main className="bg-background relative flex w-full flex-col">
          <div className="flex flex-col w-full border-b border-gray-300"></div>
          <Outlet />
        </main>
        <Toaster
          theme={theme}
          visibleToasts={1}
          toastOptions={{
            className: '!text-xs',
            style: {
              fontFamily: 'var(--font-geist-mono)',
            },
          }}
          position="bottom-right"
        />
      </div>
    </ThemeProvider>
  );
}
