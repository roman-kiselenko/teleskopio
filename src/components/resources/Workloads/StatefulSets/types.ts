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

export type { StatefulSet };
