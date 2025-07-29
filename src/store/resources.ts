import { hookstate, useHookstate } from '@hookstate/core';
import { Pod, Deployment, DaemonSet, ReplicaSet, StatefulSet, Job, CronJob } from '@/types';

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
