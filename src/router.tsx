import { createBrowserRouter } from 'react-router-dom';
import { ClusterPage } from './components/pages/Cluster';
import Pods from '@/components/resources/Workloads/Pods';
import { ResourceEvents } from '@/components/resources/ResourceEvents';
import Deployments from '@/components/resources/Workloads/Deployments';
import DaemonSets from '@/components/resources/Workloads/DaemonSets';
import { PodLogs } from '@/components/resources/Workloads/PodLogs';
import ReplicaSets from '@/components/resources/Workloads/ReplicaSets';
import StatefulSets from '@/components/resources/Workloads/StatefulSets';
import Jobs from '@/components/resources/Workloads/Jobs';
import CronJobs from '@/components/resources/Workloads/CronJobs';
import MutatingWebhooks from '@/components/resources/Configs/MutatingWebhooks';
import ValidatingWebhooks from '@/components/resources/Configs/ValidatingWebhooks';
import ConfigMaps from '@/components/resources/Configs/ConfigMaps';
import Secrets from '@/components/resources/Configs/Secrets';
import Namespaces from '@/components/resources/Configs/Namespaces';
import HorizontalPodAutoscalers from '@/components/resources/Configs/HorizontalPodAutoscalers';
import PodDisruptionBudgets from '@/components/resources/Configs/PodDisruptionBudgets';
import StorageClasses from '@/components/resources/Storage/StorageClasses';
import Services from '@/components/resources/Network/Services';
import IngressClasses from '@/components/resources/Network/IngressClasses';
import Ingresses from '@/components/resources/Network/Ingresses';
import Endpoints from '@/components/resources/Network/Endpoints';
import NetworkPolicies from '@/components/resources/Network/NetworkPolicies';
import Roles from '@/components/resources/Access/Roles';
import ServiceAccounts from '@/components/resources/Access/ServiceAccounts';
import { ResourceEditor } from '@/components/resources/ResourceEditor';
import { Load } from '@/loaders';
import { StartPage } from './components/pages/Start';
import { SettingsPage } from '@/components/pages/Settings';

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
      {
        path: '/cluster/nodes/:name',
        loader: async ({ params }: { params: any }) => {
          return {
            name: params.name,
            data: await Load('Node', params.name, ''),
          };
        },
        element: <ResourceEditor />,
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
      {
        path: '/pods/logs/:namespace/:name',
        loader: async ({ params }: { params: any }) => {
          return {
            name: params.name,
            ns: params.namespace,
            data: await Load('Pod', params.name, params.namespace),
          };
        },
        element: <PodLogs />,
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
    path: '/mutatingwebhooks',
    element: <Layout />,
    children: [
      {
        path: '/mutatingwebhooks',
        element: <MutatingWebhooks />,
      },
    ],
  },
  {
    path: '/validatingwebhooks',
    element: <Layout />,
    children: [
      {
        path: '/validatingwebhooks',
        element: <ValidatingWebhooks />,
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
    path: '/poddisruptionbudgets',
    element: <Layout />,
    children: [
      {
        path: '/poddisruptionbudgets',
        element: <PodDisruptionBudgets />,
      },
    ],
  },
  {
    path: '/horizontalpodautoscalers',
    element: <Layout />,
    children: [
      {
        path: '/horizontalpodautoscalers',
        element: <HorizontalPodAutoscalers />,
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
    path: '/endpoints',
    element: <Layout />,
    children: [
      {
        path: '/endpoints',
        element: <Endpoints />,
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
    path: '/ingressclasses',
    element: <Layout />,
    children: [
      {
        path: '/ingressclasses',
        element: <IngressClasses />,
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
  {
    path: '/storageclasses',
    element: <Layout />,
    children: [
      {
        path: '/storageclasses',
        element: <StorageClasses />,
      },
    ],
  },
  {
    path: '/settings',
    element: <Layout />,
    children: [
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/yaml',
    element: <Layout />,
    children: [
      {
        path: '/yaml/:kind/:name/:namespace',
        loader: async ({ params }: { params: any }) => {
          return {
            name: params.name,
            namespace: params.namespace,
            data: await Load(params.kind, params.name, params.namespace),
          };
        },
        element: <ResourceEditor />,
      },
    ],
  },
  {
    path: '/events',
    element: <Layout />,
    children: [
      {
        path: '/events/:kind/:uid/:namespace/',
        loader: async ({ params }: { params: any }) => {
          return {
            uid: params.uid,
            namespace: params.namespace,
          };
        },
        element: <ResourceEvents />,
      },
    ],
  },
]);
