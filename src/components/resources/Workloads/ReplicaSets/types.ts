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

export type { ReplicaSet };
