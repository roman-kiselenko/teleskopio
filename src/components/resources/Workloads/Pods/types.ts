type Container = {
  name: string;
  image: string;
  state: ContainerStatus;
};

type ContainerStatus = {
  name: string;
  image: string;
  started: any;
  running: any;
  terminated: any;
  waiting: any;
};

type Pod = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    resourceVersion: string;
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    containers: Container[];
    initContainers: Container[];
    nodeName: string;
  };
  status: {
    containerStatuses: ContainerStatus[];
    initContainerStatuses: ContainerStatus[];
    hostIP: string;
    podIP: string;
    phase?: string;
  };
};

export type { Pod, Container, ContainerStatus };
