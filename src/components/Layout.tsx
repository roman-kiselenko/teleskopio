import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useTheme } from '@/components/ThemeProvider';
import { useEffect } from 'react';

const FONT_KEY = 'app-font';
const DEFAULT_FONT = 'cascadia';

export default function Layout() {
  const { theme } = useTheme();
  useEffect(() => {
    const savedFont = localStorage.getItem(FONT_KEY) || DEFAULT_FONT;
    document.body.classList.add(savedFont);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="teleskopio-ui-theme">
      <div className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full">
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
        <main className="bg-background relative flex w-full flex-col">
          <Outlet />
        </main>
        <Toaster
          theme={theme}
          visibleToasts={1}
          toastOptions={{
            className: '!text-xs',
            style: {
              fontFamily: 'var(--app-font)',
            },
          }}
          position="bottom-right"
        />
      </div>
    </ThemeProvider>
  );
}
