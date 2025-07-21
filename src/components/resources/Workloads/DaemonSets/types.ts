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
    numberAvailable: number;
  };
};

export type { DaemonSet };
