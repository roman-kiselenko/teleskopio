type Node = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    labels: Object[];
    creationTimestamp: string;
    deletionTimestamp: string;
  };
  spec: {
    podCIDR: string;
    taints: Taint[];
  };
  status: {
    nodeInfo: {
      containerRuntimeVersion: string;
      kubeletVersion: string;
    };
    addresses: Address[];
    conditions: Condition[];
  };
};

type Taint = {
  effect: string;
  key: string;
};

type Address = {
  address: string;
  type: string;
};

type Condition = {
  reason: string;
  status: string;
  type: string;
};

export type { Node };
