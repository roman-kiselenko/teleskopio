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

export const endpointsState = hookstate<Map<string, any>>(new Map());

export function useEndpointsState() {
  return useHookstate(endpointsState);
}

export const ingressClassesState = hookstate<Map<string, any>>(new Map());

export function useIngressClassesState() {
  return useHookstate(ingressClassesState);
}

export const mutatingwebhooksState = hookstate<Map<string, any>>(new Map());

export function useMutatingWebhooksState() {
  return useHookstate(mutatingwebhooksState);
}

export const crdsState = hookstate<Map<string, any>>(new Map());

export function useCrdsState() {
  return useHookstate(crdsState);
}

export const crsState = hookstate<Map<string, any>>(new Map());

export function useCrsState() {
  return useHookstate(crsState);
}

export const limitRangesState = hookstate<Map<string, any>>(new Map());

export function useLimitRangesState() {
  return useHookstate(limitRangesState);
}

export const resourceQuotasState = hookstate<Map<string, any>>(new Map());

export function useResourceQuotasState() {
  return useHookstate(resourceQuotasState);
}

export const validatingWebhooksState = hookstate<Map<string, any>>(new Map());

export function useValidatingWebhooksState() {
  return useHookstate(validatingWebhooksState);
}

export const configmapsState = hookstate<Map<string, any>>(new Map());

export function useConfigmapsState() {
  return useHookstate(configmapsState);
}

export const podDisruptionBudgetsState = hookstate<Map<string, any>>(new Map());

export function usePodDisruptionBudgetState() {
  return useHookstate(podDisruptionBudgetsState);
}

export const horizontalPodAutoscalersState = hookstate<Map<string, any>>(new Map());

export function useHorizontalPodAutoscalerState() {
  return useHookstate(horizontalPodAutoscalersState);
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

export function flushAllStates() {
  [
    daemonSetsState,
    eventsState,
    nodesState,
    namespacesState,
    horizontalPodAutoscalersState,
    podDisruptionBudgetsState,
    configmapsState,
    validatingWebhooksState,
    resourceQuotasState,
    limitRangesState,
    crsState,
    crdsState,
    mutatingwebhooksState,
    ingressClassesState,
    endpointsState,
    ingressesState,
    networkpoliciesState,
    rolesState,
    serviceaccountsState,
    servicesState,
    storageclassesState,
    secretsState,
    statefulSetsState,
    jobsState,
    cronJobsState,
    replicaSetsState,
    podsState,
    deploymentsState,
    daemonSetsState,
  ].forEach((x) => x.set(new Map()));
}
