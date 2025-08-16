import { createBrowserRouter, useParams } from 'react-router-dom';
import Nodes from './components/resources/Cluster/Nodes';
import Events from './components/resources/Cluster/Events';
import Pods from '@/components/resources/Workloads/Pods';
import { ResourceEvents } from '@/components/resources/ResourceEvents';
import Deployments from '@/components/resources/Workloads/Deployments';
import DaemonSets from '@/components/resources/Workloads/DaemonSets';
import { PodLogs } from '@/components/resources/Workloads/PodLogs';
import ReplicaSets from '@/components/resources/Workloads/ReplicaSets';
import StatefulSets from '@/components/resources/Workloads/StatefulSets';
import Jobs from '@/components/resources/Workloads/Jobs';
import CronJobs from '@/components/resources/Workloads/CronJobs';
import MutatingWebhooks from '@/components/resources/Administration/MutatingWebhooks';
import ValidatingWebhooks from '@/components/resources/Administration/ValidatingWebhooks';
import CustomResourceDefinitions from '@/components/resources/CRD/CustomResourceDefinitions';
import CustomResources from '@/components/resources/CustomResources/CustomResources';
import ConfigMaps from '@/components/resources/Configuration/ConfigMaps';
import ResourceQuotas from '@/components/resources/Configuration/ResourceQuotas';
import LimitRanges from '@/components/resources/Configuration/LimitRanges';
import Secrets from '@/components/resources/Configuration/Secrets';
import Namespaces from '@/components/resources/Cluster/Namespaces';
import PriorityClasses from '@/components/resources/Configuration/PriorityClasses';
import HorizontalPodAutoscalers from '@/components/resources/Configuration/HorizontalPodAutoscalers';
import PodDisruptionBudgets from '@/components/resources/Configuration/PodDisruptionBudgets';
import StorageClasses from '@/components/resources/Storage/StorageClasses';
import PersistentVolumes from '@/components/resources/Storage/PersistentVolumes';
import PersistentVolumeClaims from '@/components/resources/Storage/PersistentVolumeClaims';
import VolumeAttachments from '@/components/resources/Storage/VolumeAttachments';
import Services from '@/components/resources/Networking/Services';
import IngressClasses from '@/components/resources/Networking/IngressClasses';
import Ingresses from '@/components/resources/Networking/Ingresses';
import Endpoints from '@/components/resources/Networking/Endpoints';
import NetworkPolicies from '@/components/resources/Networking/NetworkPolicies';
import Roles from '@/components/resources/Access/Roles';
import ClusterRoles from '@/components/resources/Access/ClusterRoles';
import RoleBindings from '@/components/resources/Access/RoleBindings';
import ServiceAccounts from '@/components/resources/Access/ServiceAccounts';
import ResourceEditor from '@/components/resources/ResourceEditor';
import ResourceSubmit from '@/components/resources/ResourceSubmit';
import { Load } from '@/loaders';
import { StartPage } from './components/pages/Start';
import { SettingsPage } from '@/components/pages/Settings';
import Layout from '@/components/Layout';
import ErrorPage from '@/components/ErrorPage';

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
    path: '/nodes',
    element: <Layout />,
    children: [
      {
        path: '/nodes',
        element: <Nodes />,
      },
      {
        path: '/nodes/:name',
        loader: async ({ params }: { params: any }) => {
          return {
            name: params.name,
            data: await Load('Node', '', params.name, ''),
          };
        },
        element: <ResourceEditor />,
        errorElement: <ErrorPage />,
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
            data: await Load('Pod', '', params.name, params.namespace),
          };
        },
        element: <PodLogs />,
        errorElement: <ErrorPage />,
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
    path: '/clusterroles',
    element: <Layout />,
    children: [
      {
        path: '/clusterroles',
        element: <ClusterRoles />,
      },
    ],
  },
  {
    path: '/priorityclasses',
    element: <Layout />,
    children: [
      {
        path: '/priorityclasses',
        element: <PriorityClasses />,
      },
    ],
  },
  {
    path: '/rolebindings',
    element: <Layout />,
    children: [
      {
        path: '/rolebindings',
        element: <RoleBindings />,
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
    path: '/persistentvolumes',
    element: <Layout />,
    children: [
      {
        path: '/persistentvolumes',
        element: <PersistentVolumes />,
      },
    ],
  },
  {
    path: '/persistentvolumeclaims',
    element: <Layout />,
    children: [
      {
        path: '/persistentvolumeclaims',
        element: <PersistentVolumeClaims />,
      },
    ],
  },
  {
    path: '/volumeattachments',
    element: <Layout />,
    children: [
      {
        path: '/volumeattachments',
        element: <VolumeAttachments />,
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
    path: '/limitranges',
    element: <Layout />,
    children: [
      {
        path: '/limitranges',
        element: <LimitRanges />,
      },
    ],
  },
  {
    path: '/crds',
    element: <Layout />,
    children: [
      {
        path: '/crds',
        element: <CustomResourceDefinitions />,
      },
    ],
  },
  {
    path: '/resourcequotas',
    element: <Layout />,
    children: [
      {
        path: '/resourcequotas',
        element: <ResourceQuotas />,
      },
    ],
  },
  {
    path: '/createkubernetesresource',
    element: <Layout />,
    children: [
      {
        path: '/createkubernetesresource',
        element: <ResourceSubmit />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: '/customresources',
    element: <Layout />,
    children: [
      {
        path: '/customresources/:kind/:group/:version',
        loader: async ({ params }: { params: any }) => {
          return {
            group: params.group,
            kind: params.kind,
            version: params.version,
          };
        },
        element: <KindWrapper />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: '/yaml',
    element: <Layout />,
    children: [
      {
        path: '/yaml/:kind/:name/:namespace',
        loader: async ({ params, request }: { params: any; request: Request }) => {
          const url = new URL(request.url);
          const query = Object.fromEntries(url.searchParams.entries());
          return {
            name: params.name,
            group: params.group,
            namespace: params.namespace,
            data: await Load(params.kind, query.group, params.name, params.namespace),
          };
        },
        element: <ResourceEditor />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: '/events',
    element: <Layout />,
    children: [
      {
        path: '/events',
        element: <Events />,
      },
      {
        path: '/events/:kind/:uid/:namespace/:name',
        loader: async ({ params }: { params: any }) => {
          return {
            uid: params.uid,
            name: params.name,
            namespace: params.namespace,
          };
        },
        element: <ResourceEvents />,
        errorElement: <ErrorPage />,
      },
    ],
  },
]);

function KindWrapper() {
  const { kind } = useParams();
  return <CustomResources key={`${kind}-${Math.random()}`} />;
}
