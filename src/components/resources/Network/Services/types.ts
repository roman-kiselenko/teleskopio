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

export type { Service };
