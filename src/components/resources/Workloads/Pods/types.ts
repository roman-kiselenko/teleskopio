type Container = {
  name: string;
  image: string;
  started: Boolean;
  running: Boolean;
  terminated: Boolean;
  waiting: Boolean;
  started_at: string;
  exit_code: number;
  container_type: String;
  reason: string;
};

type Pod = {
  name: string;
  namespace: string;
  uid: string;
  age: string;
  deletionTimestamp: string;
  containers: Container[];
  initContainers: Container[];
  node_name: string;
  host_ip: string;
  pod_ip: string;
  phase?: string;
  is_terminating: Boolean;
};

export type { Pod, Container };
