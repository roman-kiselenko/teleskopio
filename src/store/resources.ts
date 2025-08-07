import { hookstate, useHookstate } from '@hookstate/core';

export const daemonSetsState = hookstate<Map<string, any>>(new Map());

export function useDaemonSetsState() {
  return useHookstate(daemonSetsState);
}

export const deploymentsState = hookstate<Map<string, any>>(new Map());

export function useDeploymentsState() {
  return useHookstate(deploymentsState);
}

export const podsState = hookstate<Map<string, any>>(new Map());

export function usePodsState() {
  return useHookstate(podsState);
}

export const replicaSetsState = hookstate<Map<string, any>>(new Map());

export function useReplicaSetsState() {
  return useHookstate(replicaSetsState);
}

export const cronJobsState = hookstate<Map<string, any>>(new Map());

export function useCronJobsState() {
  return useHookstate(cronJobsState);
}

export const jobsState = hookstate<Map<string, any>>(new Map());

export function useJobsState() {
  return useHookstate(jobsState);
}

export const statefulSetsState = hookstate<Map<string, any>>(new Map());

export function useStatefulSetsState() {
  return useHookstate(statefulSetsState);
}

export const secretsState = hookstate<Map<string, any>>(new Map());

export function useSecretsState() {
  return useHookstate(secretsState);
}

export const storageclassesState = hookstate<Map<string, any>>(new Map());

export function useStorageClassesState() {
  return useHookstate(storageclassesState);
}

export const servicesState = hookstate<Map<string, any>>(new Map());

export function useServicesState() {
  return useHookstate(servicesState);
}

export const serviceaccountsState = hookstate<Map<string, any>>(new Map());

export function useServiceAccountsState() {
  return useHookstate(serviceaccountsState);
}

export const rolesState = hookstate<Map<string, any>>(new Map());

export function useRolesState() {
  return useHookstate(rolesState);
}

export const networkpoliciesState = hookstate<Map<string, any>>(new Map());

export function useNetworkPoliciesState() {
  return useHookstate(networkpoliciesState);
}

export const ingressesState = hookstate<Map<string, any>>(new Map());

export function useIngressesState() {
  return useHookstate(ingressesState);
}

export const mutatingwebhooksState = hookstate<Map<string, any>>(new Map());

export function useMutatingWebhooksState() {
  return useHookstate(configmapsState);
}

export const configmapsState = hookstate<Map<string, any>>(new Map());

export function useConfigmapsState() {
  return useHookstate(configmapsState);
}

export const namespacesState = hookstate<Map<string, any>>(new Map());

export function useNamespacesState() {
  return useHookstate(namespacesState);
}

export const nodesState = hookstate<Map<string, any>>(new Map());

export function useNodesState() {
  return useHookstate(nodesState);
}

export const eventsState = hookstate<Map<string, any>>(new Map());

export function useEventsState() {
  return useHookstate(eventsState);
}
