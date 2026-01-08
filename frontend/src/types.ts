type Cluster = {
  name: string;
  path: string;
  server?: string;
};

type HelmChart = {
  name: string;
  namespace: string;
  chart: {
    metadata: {
      icon: string;
      version: string;
    };
  };
  info: {
    last_deployed: string;
    status: string;
  };
  version: number;
};

type ApiResource = {
  group: string;
  version: string;
  kind: string;
  namespaced: boolean;
};

export type { Cluster, ApiResource, HelmChart };
