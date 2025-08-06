type ContainerStatus = {
  name: string;
  ready: Boolean;
  started: Boolean;
  containerType: string;
  state: {
    waiting: {
      message: string;
      reason: string;
    };
    terminated: {
      exitCode: number;
      startedAt: string;
      reason: string;
    };
    running: {
      startedAt: string;
    };
  };
};

type Pod = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    labels: Object[];
    creationTimestamp: string;
    deletionTimestamp?: string;
  };
  spec: {
    nodeName: string;
  };
  status: {
    podIP: string;
    phase: string;
    initContainerStatuses: ContainerStatus[];
    ephemeralContainerStatuses: ContainerStatus[];
    containerStatuses: ContainerStatus[];
  };
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

type Event = {
  action: string;
  count: number;
  message: string;
  type: string;
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    deletionTimestamp: string;
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
  kind: string;
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
  kind: string;
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
  kind: string;
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

type Namespace = {
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
  ContainerStatus,
  Cluster,
  Node,
  Event,
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
  Namespace,
};
