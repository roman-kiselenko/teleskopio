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

export type { CronJob };
