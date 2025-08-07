type Cluster = {
  name: string;
  path: string;
  server?: string;
};

type ApiResource = {
  group: string;
  version: string;
  kind: string;
  namespaced: Boolean;
};

export type { Cluster, ApiResource };
