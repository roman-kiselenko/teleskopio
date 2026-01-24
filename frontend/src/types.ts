type Cluster = {
  name: string;
  path: string;
  server?: string;
};

type HelmRelease = {
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
    notes: string;
    status: string;
  };
  version: number;
};

type ApiResource = {
  resource: string;
  group: string;
  version: string;
  kind: string;
  namespaced: boolean;
};

export type { Cluster, ApiResource, HelmRelease };
