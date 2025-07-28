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

type Deployment = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    replicas: number;
  };
  status: {
    availableReplicas: number;
  };
};

type DaemonSet = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {};
  status: {
    desiredNumberScheduled: number;
    numberReady: number;
  };
};

type Job = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    backoffLimit: number;
  };
  status: {
    ready: number;
    succeeded: number;
  };
};

type CronJob = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    schedule: string;
  };
  status: {};
};

type ReplicaSet = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    replicas: number;
  };
  status: {
    availableReplicas: number;
    fullyLabeledReplicas: number;
    readyReplicas: number;
    replicas: number;
  };
};

type StorageClass = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  provisioner: string;
  reclaimPolicy: string;
  volumeBindingMode: string;
};

type Ingress = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    ingressClassName: string;
  };
};

type NetworkPolicy = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    policyTypes: string[];
  };
};

type Service = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    clusterIP: string;
    type: string;
    internalTrafficPolicy: string;
  };
};

type ConfigMap = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {};
  status: {};
};

type Secret = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {};
  type: string;
};

type ServiceAccount = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
};

type Role = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
};

export type {
  Pod,
  Container,
  Cluster,
  Node,
  StatefulSet,
  Deployment,
  DaemonSet,
  Job,
  CronJob,
  ReplicaSet,
  StorageClass,
  Ingress,
  NetworkPolicy,
  Service,
  ConfigMap,
  Secret,
  ServiceAccount,
  Role,
};
