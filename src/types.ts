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
  creation_timestamp: string;
  containers: Container[];
  node_name: string;
  host_ip: string;
  pod_ip: string;
  phase?: string;
  is_terminating: Boolean;
};

type Cluster = {
  name: string;
  path: string;
  server?: string;
};

type Node = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    labels: Object[];
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    podCIDR: string;
    taints: Taint[];
  };
  status: {
    nodeInfo: {
      containerRuntimeVersion: string;
      kubeletVersion: string;
    };
    addresses: Address[];
    conditions: Condition[];
  };
};

type Taint = {
  effect: string;
  key: string;
};

type Address = {
  address: string;
  type: string;
};

type Condition = {
  reason: string;
  status: string;
  type: string;
};

type StatefulSet = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {};
  status: {
    currentReplicas: number;
    availableReplicas: number;
  };
};

export type { Pod, Container, Cluster, Node, StatefulSet };
