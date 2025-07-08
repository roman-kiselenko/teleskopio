import { createBrowserRouter } from 'react-router-dom';
import { StartPage } from './components/pages/Start';
import { ClusterPage } from './components/pages/Cluster';
import { WorkloadsPage } from './components/pages/Workloads';
import { ConfigPage } from './components/pages/Config';
import { NetworkPage } from './components/pages/Network';
import { SettingsPage } from './components/pages/Settings';
import { StoragePage } from './components/pages/Storage';
import { AccessPage } from './components/pages/Access';
import { Layout } from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <StartPage />,
      },
      {
        path: '/cluster',
        element: <ClusterPage />,
      },
      {
        path: '/workloads',
        element: <WorkloadsPage />,
      },
      {
        path: '/config',
        element: <ConfigPage />,
      },
      {
        path: '/network',
        element: <NetworkPage />,
      },
      {
        path: '/storage',
        element: <StoragePage />,
      },
      {
        path: '/access',
        element: <AccessPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
]);
