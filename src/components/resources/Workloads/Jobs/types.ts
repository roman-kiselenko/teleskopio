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

export type { Job };
