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

export type { Ingress };
