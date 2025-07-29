import { hookstate, useHookstate } from '@hookstate/core';
import {
  Pod,
  Deployment,
  DaemonSet,
  ReplicaSet,
  StatefulSet,
  Job,
  CronJob,
  Secret,
  StorageClass,
  Service,
  ServiceAccount,
  Role,
  NetworkPolicy,
  Ingress,
  ConfigMap,
  Namespace,
} from '@/types';

export const daemonSetsState = hookstate<Map<string, DaemonSet>>(new Map());

export function useDaemonSetsState() {
  return useHookstate(daemonSetsState);
}

export const deploymentsState = hookstate<Map<string, Deployment>>(new Map());

export function useDeploymentsState() {
  return useHookstate(deploymentsState);
}

export const podsState = hookstate<Map<string, Pod>>(new Map());

export function usePodsState() {
  return useHookstate(podsState);
}

export const replicaSetsState = hookstate<Map<string, ReplicaSet>>(new Map());

export function useReplicaSetsState() {
  return useHookstate(replicaSetsState);
}

export const cronJobsState = hookstate<Map<string, CronJob>>(new Map());

export function useCronJobsState() {
  return useHookstate(cronJobsState);
}

export const jobsState = hookstate<Map<string, Job>>(new Map());

export function useJobsState() {
  return useHookstate(jobsState);
}

export const statefulSetsState = hookstate<Map<string, StatefulSet>>(new Map());

export function useStatefulSetsState() {
  return useHookstate(statefulSetsState);
}

export const secretsState = hookstate<Map<string, Secret>>(new Map());

export function useSecretsState() {
  return useHookstate(secretsState);
}

export const storageclassesState = hookstate<Map<string, StorageClass>>(new Map());

export function useStorageClassesState() {
  return useHookstate(storageclassesState);
}

export const servicesState = hookstate<Map<string, Service>>(new Map());

export function useServicesState() {
  return useHookstate(servicesState);
}

export const serviceaccountsState = hookstate<Map<string, ServiceAccount>>(new Map());

export function useServiceAccountsState() {
  return useHookstate(serviceaccountsState);
}

export const rolesState = hookstate<Map<string, Role>>(new Map());

export function useRolesState() {
  return useHookstate(rolesState);
}

export const networkpoliciesState = hookstate<Map<string, NetworkPolicy>>(new Map());

export function useNetworkPoliciesState() {
  return useHookstate(networkpoliciesState);
}

export const ingressesState = hookstate<Map<string, Ingress>>(new Map());

export function useIngressesState() {
  return useHookstate(ingressesState);
}

export const configmapsState = hookstate<Map<string, ConfigMap>>(new Map());

export function useConfigmapsState() {
  return useHookstate(configmapsState);
}

export const namespacesState = hookstate<Map<string, Namespace>>(new Map());

export function useNamespacesState() {
  return useHookstate(namespacesState);
}
