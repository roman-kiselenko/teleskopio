export const MANAGED_FIELDS = 'managedfields';

export const FONT_KEY = 'app-font';
export const DEFAULT_FONT = 'cascadia';

export const FONT_SIZE_KEY = 'fontSize';
export const DEFAULT_FONT_SIZE = 12;

export const Fonts = [
  { label: 'JetBrains Mono', className: 'jetbrains' },
  { label: 'Cascadia Code', className: 'cascadia' },
  { label: 'Geist Code', className: 'geist' },
  { label: 'Iosevka', className: 'iosevka' },
  { label: 'Roboto Mono', className: 'roboto' },
  { label: 'Source Code Pro', className: 'source-code' },
];

export function pathToKind(path: string): string | undefined {
  const mapping: Record<string, string> = {
    '/pods': 'Pod',
    '/deployments': 'Deployment',
    '/daemonsets': 'DaemonSet',
    '/services': 'Service',
    '/statefulsets': 'StatefulSet',
    '/nodes': 'Node',
    '/jobs': 'Job',
    '/cronjobs': 'CronJob',
    '/secrets': 'Secret',
    '/configmaps': 'ConfigMap',
  };

  return mapping[path];
}
