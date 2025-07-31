import { createBrowserRouter } from 'react-router-dom';
import { ClusterPage } from './components/pages/Cluster';
import { WorkloadsPage } from './components/pages/Workloads';
import { StartPage } from './components/pages/Start';
import { ConfigsPage } from './components/pages/Configs';
import { NetworkPage } from './components/pages/Network';
import { SettingsPage } from './components/pages/Settings';
import { StoragePage } from './components/pages/Storage';
import { AccessPage } from './components/pages/Access';
import { PodsLayout } from '@/components/pages/PodsLayout';
import { PodPage } from '@/components/pages/PodPage';

import Layout from './components/Layout';

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
        children: [
          {
            children: [{ path: 'pods/:uid', Component: PodPage }],
          },
        ],
      },
      {
        path: '/config',
        element: <ConfigsPage />,
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
