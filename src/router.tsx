import { createBrowserRouter } from 'react-router-dom';
import { ClusterPage } from './components/pages/Cluster';
import Pods from '@/components/resources/Workloads/Pods';
import Deployments from '@/components/resources/Workloads/Deployments';
import DaemonSets from '@/components/resources/Workloads/DaemonSets';
import ReplicaSets from '@/components/resources/Workloads/ReplicaSets';
import StatefulSets from '@/components/resources/Workloads/StatefulSets';
import Jobs from '@/components/resources/Workloads/Jobs';
import CronJobs from '@/components/resources/Workloads/CronJobs';
import ConfigMaps from '@/components/resources/Configs/ConfigMaps';
import Secrets from '@/components/resources/Configs/Secrets';
import Namespaces from '@/components/resources/Configs/Namespaces';
import Services from '@/components/resources/Network/Services';
import Ingresses from '@/components/resources/Network/Ingresses';
import NetworkPolicies from '@/components/resources/Network/NetworkPolicies';
import Roles from '@/components/resources/Access/Roles';
import ServiceAccounts from '@/components/resources/Access/ServiceAccounts';
import { StartPage } from './components/pages/Start';

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
    ],
  },
  {
    path: '/cluster',
    element: <Layout />,
    children: [
      {
        path: '/cluster',
        element: <ClusterPage />,
      },
    ],
  },
  {
    path: '/pods',
    element: <Layout />,
    children: [
      {
        path: '/pods',
        element: <Pods />,
      },
    ],
  },
  {
    path: '/deployments',
    element: <Layout />,
    children: [
      {
        path: '/deployments',
        element: <Deployments />,
      },
    ],
  },
  {
    path: '/daemonsets',
    element: <Layout />,
    children: [
      {
        path: '/daemonsets',
        element: <DaemonSets />,
      },
    ],
  },
  {
    path: '/statefulsets',
    element: <Layout />,
    children: [
      {
        path: '/statefulsets',
        element: <StatefulSets />,
      },
    ],
  },
  {
    path: '/replicasets',
    element: <Layout />,
    children: [
      {
        path: '/replicasets',
        element: <ReplicaSets />,
      },
    ],
  },
  {
    path: '/jobs',
    element: <Layout />,
    children: [
      {
        path: '/jobs',
        element: <Jobs />,
      },
    ],
  },
  {
    path: '/cronjobs',
    element: <Layout />,
    children: [
      {
        path: '/cronjobs',
        element: <CronJobs />,
      },
    ],
  },
  {
    path: '/configmaps',
    element: <Layout />,
    children: [
      {
        path: '/configmaps',
        element: <ConfigMaps />,
      },
    ],
  },
  {
    path: '/secrets',
    element: <Layout />,
    children: [
      {
        path: '/secrets',
        element: <Secrets />,
      },
    ],
  },
  {
    path: '/namespaces',
    element: <Layout />,
    children: [
      {
        path: '/namespaces',
        element: <Namespaces />,
      },
    ],
  },
  {
    path: '/services',
    element: <Layout />,
    children: [
      {
        path: '/services',
        element: <Services />,
      },
    ],
  },
  {
    path: '/ingresses',
    element: <Layout />,
    children: [
      {
        path: '/ingresses',
        element: <Ingresses />,
      },
    ],
  },
  {
    path: '/networkpolicies',
    element: <Layout />,
    children: [
      {
        path: '/networkpolicies',
        element: <NetworkPolicies />,
      },
    ],
  },
  {
    path: '/roles',
    element: <Layout />,
    children: [
      {
        path: '/roles',
        element: <Roles />,
      },
    ],
  },
  {
    path: '/serviceaccounts',
    element: <Layout />,
    children: [
      {
        path: '/serviceaccounts',
        element: <ServiceAccounts />,
      },
    ],
  },
]);
