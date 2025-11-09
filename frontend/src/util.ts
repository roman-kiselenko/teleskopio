import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractGroupVersion(d: string) {
  return d.split('/');
}

export function cordoned(obj: any) {
  return obj.spec?.taints?.find(
    (t) => t.effect === 'NoSchedule' && t.key === 'node.kubernetes.io/unschedulable',
  );
}
