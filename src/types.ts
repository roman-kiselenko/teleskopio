type Cluster = {
  name: string;
  path: string;
  current_context?: string;
  server?: string;
};

type ApiResource = {
  group: string;
  version: string;
  kind: string;
  namespaced: Boolean;
};

export type { Cluster, ApiResource };
