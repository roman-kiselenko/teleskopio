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

export type { Deployment };
