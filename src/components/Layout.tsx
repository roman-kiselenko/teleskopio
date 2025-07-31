import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="teleskopio-ui-theme">
      <div>
        <SidebarProvider>
          <AppSidebar />
          <main>{children}</main>
          <Outlet />
        </SidebarProvider>
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
