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

export type { StorageClass };
