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

export type { NetworkPolicy };
